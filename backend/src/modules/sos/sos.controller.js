const sosService = require("./sos.service");
const {
  createSosSchema,
  escalateSosSchema,
  falseAlertSchema,
  objectIdParamSchema,
  resolveSosSchema,
  sosQuerySchema,
  updateSosSchema,
} = require("./sos.validation");

const validate = (schema, data) => schema.validate(data, { abortEarly: false, stripUnknown: true });
const validationErrorResponse = (res, error) =>
  res.status(400).json({ success: false, message: error.details.map((detail) => detail.message).join(", ") });

const createSos = async (req, res, next) => {
  try {
    const { error, value } = validate(createSosSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const sos = await sosService.createSos({ civilianId: req.user._id, payload: value });
    return res.status(201).json({ success: true, message: "SOS emergency created", data: sos });
  } catch (error) {
    return next(error);
  }
};

const mySos = async (req, res, next) => {
  try {
    const { error, value } = validate(sosQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await sosService.getMySos({ civilianId: req.user._id, page: value.page, limit: value.limit });
    return res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const policeSos = async (req, res, next) => {
  try {
    const { error, value } = validate(sosQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await sosService.getPoliceSos(value, req.user);
    return res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const updateSos = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);
    const body = validate(updateSosSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);

    const sos = await sosService.updateSos({ sosId: params.value.id, payload: body.value, actorId: req.user._id });
    return res.status(200).json({ success: true, message: "SOS updated", data: sos });
  } catch (error) {
    return next(error);
  }
};

const respond = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);
    const sos = await sosService.respondToSos({ sosId: params.value.id, officer: req.user });
    return res.status(200).json({ success: true, message: "SOS response accepted", data: sos });
  } catch (error) {
    return next(error);
  }
};

const onScene = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);
    const sos = await sosService.markOnScene({ sosId: params.value.id, officer: req.user });
    return res.status(200).json({ success: true, message: "SOS marked on scene", data: sos });
  } catch (error) {
    return next(error);
  }
};

const resolve = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);
    const body = validate(resolveSosSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);
    const sos = await sosService.resolveSos({ sosId: params.value.id, officer: req.user, payload: body.value });
    return res.status(200).json({ success: true, message: "SOS resolved", data: sos });
  } catch (error) {
    return next(error);
  }
};

const escalate = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);
    const body = validate(escalateSosSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);
    const sos = await sosService.escalateSos({ sosId: params.value.id, officer: req.user, payload: body.value });
    return res.status(200).json({ success: true, message: "SOS escalated", data: sos });
  } catch (error) {
    return next(error);
  }
};

const falseAlert = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);
    const body = validate(falseAlertSchema, req.body);
    if (body.error) return validationErrorResponse(res, body.error);
    const sos = await sosService.markFalseAlert({ sosId: params.value.id, officer: req.user, payload: body.value });
    return res.status(200).json({ success: true, message: "SOS marked false alert", data: sos });
  } catch (error) {
    return next(error);
  }
};

const analytics = async (req, res, next) => {
  try {
    const data = await sosService.getSosAnalytics(req.user);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  analytics,
  createSos,
  escalate,
  falseAlert,
  mySos,
  onScene,
  policeSos,
  respond,
  resolve,
  updateSos,
};
