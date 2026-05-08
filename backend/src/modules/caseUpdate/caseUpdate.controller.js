const caseUpdateService = require("./caseUpdate.service");
const {
  createCaseUpdateSchema,
  firTimelineParamSchema,
  objectIdParamSchema,
  timelineQuerySchema,
  updateStatusSchema,
} = require("./caseUpdate.validation");

const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

const validationErrorResponse = (res, error) =>
  res.status(400).json({
    success: false,
    message: error.details.map((detail) => detail.message).join(", "),
  });

const createCaseUpdate = async (req, res, next) => {
  try {
    const { error, value } = validate(createCaseUpdateSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const caseUpdate = await caseUpdateService.createCaseUpdate(value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Case update added successfully",
      data: caseUpdate,
    });
  } catch (error) {
    return next(error);
  }
};

const getFirTimeline = async (req, res, next) => {
  try {
    const params = validate(firTimelineParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const query = validate(timelineQuerySchema, req.query);
    if (query.error) return validationErrorResponse(res, query.error);

    const result = await caseUpdateService.getFirTimeline({
      firId: params.value.firId,
      page: query.value.page,
      limit: query.value.limit,
    });

    return res.status(200).json({
      success: true,
      message: "FIR investigation timeline fetched successfully",
      data: result.updates,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const updateFirStatus = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const body = validate(updateStatusSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const caseUpdate = await caseUpdateService.updateFirStatusFromCaseUpdate({
      caseUpdateId: params.value.id,
      newStatus: body.value.newStatus,
      title: body.value.title,
      description: body.value.description,
      actorId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "FIR status updated successfully",
      data: caseUpdate,
    });
  } catch (error) {
    return next(error);
  }
};

const uploadEvidence = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const caseUpdate = await caseUpdateService.uploadEvidence({
      caseUpdateId: params.value.id,
      files: req.files || [],
      actorId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Evidence uploaded successfully",
      data: caseUpdate,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCaseUpdate,
  getFirTimeline,
  uploadEvidence,
  updateFirStatus,
};
