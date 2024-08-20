import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';

export const sendNotification = async (podcastId, episodeTitle) => {
    try {
        const subscriptions = await Subscription.find({ podcastId }).populate('userId')

        const notification = new subscriptions.map(subscription => ({
            userId: subscription.userId._id,
            message: `${episodeTitle} has been published to a podcast you're subscribed to.`,
            date: new Date()
        }))

        await Notification.insertMany(notification);
    } catch (e) {
        console.error("Error sending notification", e)
    }
}

export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200 || 201).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
}

export const getNotification = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200 || 201).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
}