const { AuditLog, Notification } = require("../../models");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

const createNotification = async ({ userId, userModel = "User", title, message, type, relatedEntityType, relatedEntityId }) => {
  if (!userId) return null;

  const notification = await Notification.create({
    user_id: userId,
    user_model: userModel,
    title,
    message,
    type,
    related_entity_type: relatedEntityType,
    related_entity_id: relatedEntityId,
  });

  await AuditLog.create({
    user_id: userId,
    action: "CREATE_NOTIFICATION",
    entity_type: "NOTIFICATION",
    entity_id: notification._id,
  });

  return notification;
};

const getNotifications = async ({ userId, unread, page, limit }) => {
  const filter = { user_id: userId };
  if (unread === true) filter.isRead = false;

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user_id: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const markAsRead = async ({ notificationId, userId }) => {
  const notification = await Notification.findOne({ _id: notificationId, user_id: userId });
  if (!notification) throw new NotFoundError("Notification not found");

  notification.isRead = true;
  await notification.save();

  await AuditLog.create({
    user_id: userId,
    action: "UPDATE_NOTIFICATION",
    entity_type: "NOTIFICATION",
    entity_id: notification._id,
  });

  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};
