const hierarchyService = require("./hierarchy.service");

const getOverview = async (req, res, next) => {
  try {
    const data = await hierarchyService.getOperationalOverview(req.user);
    return res.status(200).json({
      success: true,
      message: "Hierarchy-scoped operational overview fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOverview,
};
