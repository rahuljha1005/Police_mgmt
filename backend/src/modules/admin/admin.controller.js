const adminService = require("./admin.service");
const {
  auditLogsQuerySchema,
  changeRoleSchema,
  createCrimeTypeSchema,
  createOfficerSchema,
  getOfficersQuerySchema,
  objectIdParamSchema,
  verifyOfficerSchema,
} = require("./admin.validation");

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

const createOfficer = async (req, res, next) => {
  try {
    const { error, value } = validate(createOfficerSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const createdOfficer = await adminService.createOfficer(value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Officer created successfully",
      data: createdOfficer,
    });
  } catch (error) {
    return next(error);
  }
};

const verifyOfficer = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const body = validate(verifyOfficerSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const officer = await adminService.verifyOfficer(params.value.id, body.value.status, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Officer verification updated successfully",
      data: officer,
    });
  } catch (error) {
    return next(error);
  }
};

const changeOfficerRole = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const body = validate(changeRoleSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const officer = await adminService.changeOfficerRole(params.value.id, body.value.role, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Officer role updated successfully",
      data: officer,
    });
  } catch (error) {
    return next(error);
  }
};

const getOfficers = async (req, res, next) => {
  try {
    const { error, value } = validate(getOfficersQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await adminService.getOfficers(value);

    return res.status(200).json({
      success: true,
      message: "Officers fetched successfully",
      data: result.officers,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { error, value } = validate(auditLogsQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await adminService.getAuditLogs(value);

    return res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const createCrimeType = async (req, res, next) => {
  try {
    const { error, value } = validate(createCrimeTypeSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const crimeType = await adminService.createCrimeType(value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Crime type created successfully",
      data: crimeType,
    });
  } catch (error) {
    return next(error);
  }
};

const getCrimeTypes = async (req, res, next) => {
  try {
    const crimeTypes = await adminService.getCrimeTypes();

    return res.status(200).json({
      success: true,
      message: "Crime types fetched successfully",
      data: crimeTypes,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCrimeType = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    await adminService.deleteCrimeType(params.value.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Crime type deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboard();

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
};

const getReferenceData = async (req, res, next) => {
  try {
    const referenceData = await adminService.getReferenceData();

    return res.status(200).json({
      success: true,
      message: "Reference data fetched successfully",
      data: referenceData,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  changeOfficerRole,
  createCrimeType,
  createOfficer,
  deleteCrimeType,
  getAuditLogs,
  getCrimeTypes,
  getDashboard,
  getOfficers,
  getReferenceData,
  verifyOfficer,
};
