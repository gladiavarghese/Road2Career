const { query } = require('../config/db');

/**
 * GET /api/notifications - Get student's notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE user_id = $1';
    if (unread === 'true') where += ' AND is_read = false';

    const result = await query(
      `SELECT *, COUNT(*) OVER() as total_count FROM notifications ${where}
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    const unreadCount = await query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false', [req.user.id]);

    res.json({
      success: true,
      data: result.rows,
      unreadCount: parseInt(unreadCount.rows[0]?.count) || 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read - Mark notification as read
 */
const markRead = async (req, res, next) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all - Mark all notifications as read
 */
const markAllRead = async (req, res, next) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id - Delete a notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    await query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
