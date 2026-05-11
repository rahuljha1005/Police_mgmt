const transferService = require("./transfer.service");
const { assignmentQuerySchema, bulkTransferSchema, suggestionsQuerySchema } = require("./transfer.validation");

const validate = (schema, data) => schema.validate(data, { abortEarly: false, stripUnknown: true });
const validationErrorResponse = (res, error) =>
  res.status(400).json({ success: false, message: error.details.map((detail) => detail.message).join(", ") });

const workloads = async (req, res, next) => {
  try {
    const data = await transferService.getOfficerWorkloads(req.user);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const assignments = async (req, res, next) => {
  try {
    const { error, value } = validate(assignmentQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);
    const data = await transferService.getTransferAssignments({ actor: req.user, officerId: value.officerId });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const suggestions = async (req, res, next) => {
  try {
    const { error, value } = validate(suggestionsQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);
    const data = await transferService.getReplacementSuggestions({
      actor: req.user,
      fromOfficerId: value.fromOfficerId,
      includeDistrict: value.includeDistrict,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const bulkTransfer = async (req, res, next) => {
  try {
    const { error, value } = validate(bulkTransferSchema, req.body);
    if (error) return validationErrorResponse(res, error);
    const data = await transferService.bulkTransfer({ actor: req.user, payload: value });
    return res.status(200).json({
      success: true,
      message: "Case handover completed successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  assignments,
  bulkTransfer,
  suggestions,
  workloads,
};
