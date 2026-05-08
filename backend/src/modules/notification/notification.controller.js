const notificationService = require("./notification.service");
const { notificationQuerySchema, objectIdParamSchema } = require("./notification.validation");

const validate = (schema, data) => schema.validate(data, { abortEarly: false, stripUnknown: true });

const validationErrorResponse = (res, error) =>
  res.status(400).json({
    success: false,
    message: error.details.map((detail) => detail.message).join(", "),
  });

const getNotifications = async (req, res, next) => {
  try {
    const { error, value } = validate(notificationQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const result = await notificationService.getNotifications({
      userId: req.user._id,
      unread: value.unread,
      page: value.page,
      limit: value.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result.notifications,
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const params = validate(objectIdParamSchema, req.params);
    if (params.error) return validationErrorResponse(res, params.error);

    const notification = await notificationService.markAsRead({
      notificationId: params.value.id,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
