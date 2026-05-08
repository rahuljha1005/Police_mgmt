const firService = require("./fir.service");
const {
  assignOfficerSchema,
  createFirSchema,
  getFirsQuerySchema,
  objectIdParamSchema,
} = require("./fir.validation");

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

const createFir = async (req, res, next) => {
  try {
    const { error, value } = validate(createFirSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const fir = await firService.createFir(value, req.user._id);

    return res.status(201).json({
      success: true,
      message: "FIR created successfully",
      data: fir,
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

    const fir = await firService.assignOfficer(params.value.id, body.value.assigned_officer_id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Officer assigned successfully",
      data: fir,
    });
  } catch (error) {
    return next(error);
  }
};

const getFirs = async (req, res, next) => {
  try {
    const { error, value } = validate(getFirsQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await firService.getFirs(value);

    return res.status(200).json({
      success: true,
      message: "FIRs fetched successfully",
      data: result.firs,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getFirById = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const fir = await firService.getFirById(params.value.id);

    return res.status(200).json({
      success: true,
      message: "FIR fetched successfully",
      data: fir,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  assignOfficer,
  createFir,
  getFirById,
  getFirs,
};
