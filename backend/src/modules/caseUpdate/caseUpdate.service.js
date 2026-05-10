const { AuditLog, CaseUpdate, FIR, User } = require("../../models");
const { createNotification } = require("../notification/notification.service");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}

const statusToDb = {
  OPEN: "open",
  INVESTIGATING: "investigating",
  CLOSED: "closed",
};

const statusFromDb = {
  open: "OPEN",
  investigating: "INVESTIGATING",
  closed: "CLOSED",
};

const allowedStatusTransitions = {
  OPEN: ["INVESTIGATING"],
  INVESTIGATING: ["CLOSED"],
  CLOSED: [],
};

const writeAuditLog = async ({ userId, action, entityId, oldValues, newValues }) =>
  AuditLog.create({
    user_id: userId,
    action,
    entity_type: "FIR",
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
  });

const assertFirAndOfficer = async ({ firId, officerId }) => {
  const [fir, officer] = await Promise.all([FIR.findById(firId), User.findById(officerId)]);

  if (!fir) throw new NotFoundError("FIR not found");
  if (!officer) throw new NotFoundError("Officer not found");

  return { fir, officer };
};

const assertValidStatusTransition = (previousStatus, newStatus) => {
  if (!allowedStatusTransitions[previousStatus]) {
    throw new BadRequestError("FIR status cannot be changed from the current state");
  }

  if (!allowedStatusTransitions[previousStatus].includes(newStatus)) {
    throw new BadRequestError(`Invalid status transition from ${previousStatus} to ${newStatus}`);
  }
};

const populateCaseUpdate = (query) =>
  query
    .populate("officer_id", "name email role phone")
    .populate("fir_id", "fir_number title status priority police_station_id assigned_officer_id");

const createCaseUpdate = async (caseUpdateData, actorId) => {
  const { fir, officer } = await assertFirAndOfficer({
    firId: caseUpdateData.fir_id,
    officerId: caseUpdateData.officer_id,
  });

  const updatePayload = {
    fir_id: fir._id,
    officer_id: officer._id,
    updateType: caseUpdateData.updateType,
    title: caseUpdateData.title,
    description: caseUpdateData.description,
    attachments: caseUpdateData.attachments || [],
  };

  if (caseUpdateData.updateType === "STATUS_CHANGED") {
    const previousStatus = statusFromDb[fir.status];
    const newStatus = caseUpdateData.newStatus;

    if (!previousStatus) {
      throw new BadRequestError("Current FIR status is not supported by the investigation lifecycle");
    }

    assertValidStatusTransition(previousStatus, newStatus);

    updatePayload.previousStatus = previousStatus;
    updatePayload.newStatus = newStatus;
    fir.status = statusToDb[newStatus];
    fir.closedAt = newStatus === "CLOSED" ? new Date() : undefined;
    await fir.save();

    await writeAuditLog({
      userId: actorId,
      action: "UPDATE_FIR_STATUS",
      entityId: fir._id,
      oldValues: { status: previousStatus },
      newValues: { status: newStatus },
    });

    await createNotification({
      userId: fir.assigned_officer_id,
      title: "FIR status changed",
      message: `${fir.fir_number} moved from ${previousStatus} to ${newStatus}`,
      type: "STATUS_CHANGED",
      relatedEntityType: "FIR",
      relatedEntityId: fir._id,
    });
  }

  const caseUpdate = await CaseUpdate.create(updatePayload);

  await writeAuditLog({
    userId: actorId,
    action: "ADD_CASE_UPDATE",
    entityId: fir._id,
    newValues: {
      case_update_id: caseUpdate._id,
      updateType: caseUpdate.updateType,
    },
  });

  if (caseUpdate.updateType === "EVIDENCE_ADDED") {
    await writeAuditLog({
      userId: actorId,
      action: "ADD_EVIDENCE",
      entityId: fir._id,
      newValues: {
        case_update_id: caseUpdate._id,
        attachments: caseUpdate.attachments,
      },
    });
  }

  await createNotification({
    userId: fir.assigned_officer_id,
    title: "Case timeline updated",
    message: `${caseUpdate.updateType}: ${caseUpdate.title}`,
    type: caseUpdate.updateType === "EVIDENCE_ADDED" ? "EVIDENCE_ADDED" : "CASE_UPDATED",
    relatedEntityType: "FIR",
    relatedEntityId: fir._id,
  });

  return populateCaseUpdate(CaseUpdate.findById(caseUpdate._id));
};

const uploadEvidence = async ({ caseUpdateId, files, actorId }) => {
  const caseUpdate = await CaseUpdate.findById(caseUpdateId).populate("fir_id", "fir_number assigned_officer_id");
  if (!caseUpdate) throw new NotFoundError("Case update not found");
  if (!files?.length) throw new BadRequestError("At least one evidence file is required");

  const existingCount = caseUpdate.attachments.length;
  if (existingCount + files.length > 5) {
    throw new BadRequestError("A case update can include at most 5 attachments");
  }

  const attachments = files.map((file) => ({
    fileUrl: file.path,
    secureUrl: file.path,
    publicId: file.filename,
    provider: "cloudinary",
    fileType: file.mimetype,
    fileName: file.originalname,
    resourceType: file.mimetype?.split("/")[0],
    bytes: file.size,
    uploadedAt: new Date(),
    uploadedBy: actorId,
  }));

  caseUpdate.attachments.push(...attachments);
  if (caseUpdate.updateType !== "EVIDENCE_ADDED") {
    caseUpdate.updateType = "EVIDENCE_ADDED";
  }
  await caseUpdate.save();

  await writeAuditLog({
    userId: actorId,
    action: "ADD_EVIDENCE",
    entityId: caseUpdate.fir_id._id,
    newValues: { case_update_id: caseUpdate._id, attachments },
  });

  await createNotification({
    userId: caseUpdate.fir_id.assigned_officer_id,
    title: "Evidence uploaded",
    message: `${attachments.length} evidence file(s) uploaded for ${caseUpdate.fir_id.fir_number}`,
    type: "EVIDENCE_ADDED",
    relatedEntityType: "FIR",
    relatedEntityId: caseUpdate.fir_id._id,
  });

  return populateCaseUpdate(CaseUpdate.findById(caseUpdate._id));
};

const getFirTimeline = async ({ firId, page, limit }) => {
  const fir = await FIR.exists({ _id: firId });
  if (!fir) throw new NotFoundError("FIR not found");

  const filter = { fir_id: firId };
  const skip = (page - 1) * limit;

  const [updates, total] = await Promise.all([
    populateCaseUpdate(CaseUpdate.find(filter))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CaseUpdate.countDocuments(filter),
  ]);

  return {
    updates,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateFirStatusFromCaseUpdate = async ({ caseUpdateId, newStatus, title, description, actorId }) => {
  const sourceUpdate = await CaseUpdate.findById(caseUpdateId);
  if (!sourceUpdate) throw new NotFoundError("Case update not found");

  return createCaseUpdate(
    {
      fir_id: sourceUpdate.fir_id,
      officer_id: actorId,
      updateType: "STATUS_CHANGED",
      title,
      description,
      newStatus,
      attachments: [],
    },
    actorId
  );
};

module.exports = {
  createCaseUpdate,
  getFirTimeline,
  uploadEvidence,
  updateFirStatusFromCaseUpdate,
};
