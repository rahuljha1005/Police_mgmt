const complaintService = require("./complaint.service");
const {
  assignOfficerSchema,
  convertComplaintToFirSchema,
  createComplaintSchema,
  getComplaintsQuerySchema,
  objectIdParamSchema,
  updateComplaintStatusSchema,
} = require("./complaint.validation");

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

const createComplaint = async (req, res, next) => {
  try {
    const { error, value } = validate(createComplaintSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const complaint = await complaintService.createComplaint(value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const createCivilianComplaint = async (req, res, next) => {
  try {
    const { error, value } = validate(createComplaintSchema.fork(["civilian"], (schema) => schema.optional()), req.body);
    if (error) return validationErrorResponse(res, error);

    const complaint = await complaintService.createCivilianComplaint(value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const { error, value } = validate(getComplaintsQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await complaintService.getComplaints(value);

    return res.status(200).json({
      success: true,
      message: "Complaints fetched successfully",
      data: result.complaints,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const complaint = await complaintService.getComplaintById(params.value.id);

    return res.status(200).json({
      success: true,
      message: "Complaint fetched successfully",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const { error, value } = validate(getComplaintsQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await complaintService.getCivilianComplaints({
      civilianId: req.user._id,
      status: value.status,
      page: value.page,
      limit: value.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Your complaints fetched successfully",
      data: result.complaints,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyComplaintById = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const complaint = await complaintService.getCivilianComplaintById(params.value.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Complaint fetched successfully",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const assignOfficer = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const body = validate(assignOfficerSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const complaint = await complaintService.assignOfficer(
      params.value.id,
      body.value.assigned_officer_id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Complaint officer assigned successfully",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const body = validate(updateComplaintStatusSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const complaint = await complaintService.updateComplaintStatus(params.value.id, body.value.status, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
};

const convertComplaintToFir = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const body = validate(convertComplaintToFirSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const result = await complaintService.convertComplaintToFir(params.value.id, body.value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Complaint converted to FIR successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  assignOfficer,
  convertComplaintToFir,
  createCivilianComplaint,
  createComplaint,
  getComplaintById,
  getComplaints,
  getMyComplaintById,
  getMyComplaints,
  updateComplaintStatus,
};
