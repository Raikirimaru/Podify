import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Podcast from '../models/Podcast.js';

export const createSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const podcast = await Podcast.findById(req.body.id);

        const existingSubscription = await Subscription.findOne({ user, podcast });
        if (existingSubscription) return res.status(400).json({ message: "User already subscribed to this podcast" });

        if (!podcast || !user) return res.status(400).json({ error: 'Podcast ID and User ID are required.' });

        const subscription = new Subscription({ user, podcast });
        await subscription.save().then(() => {
            res.status(201 || 200).json("success", "Your subscription has been saved successfully");
        }).catch(async err => {
            await createNotification(user, `You have subscribed to the podcast : ${podcast}`);
        })
    } catch (err) {
        next(err);
    }
};

export const getSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user.id }).populate('podcastId', 'name desc');
        res.status(200).json(subscriptions);
    } catch (err) {
        next(err);
    }
};

export const deleteSubscription = async (req, res, next) => {
    try {
        /* const { podcastId } = req.body;
        const userId = req.user.id; */
        const user = await User.findById(req.user.id);
        const podcast = await Podcast.findById(req.body.id);

        console.log(
            `Attempting to delete subscription for user: ${user}, podcast: ${podcast}`
        );

        const deletedSubscription = await Subscription.findOneAndDelete({
            user,
            podcast,
        });

        if (!deletedSubscription) {
            console.log("Subscription not found");
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.status(200 || 201).json({ message: "Subscription deleted successfully" });
    } catch (err) {
        console.error("Error deleting subscription:", err);
        next(err);
    }
};


export const checkSubscription = async (req, res) => {
    try {
        const podcastId  = req.podcast.id;
        const userId = req.user.id; 
        
        const subscription = await Subscription.findOne({ userId, podcastId });

        res.status(200).json({ isSubscribed: !!subscription });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const toggleSubscription = async (req, res, next) => {
    try {
        const { podcastId } = req.body;
        const userId = req.user.id;

        // Check if the subscription already exists for the given user and podcast
        const existingSubscription = await Subscription.findOne({
            userId,
            podcastId,
        });

        if (existingSubscription) {
            // If the subscription exists, delete it (unsubscribe)
            await Subscription.findOneAndDelete({ userId, podcastId });
            return res.status(200).json({ message: "Unsubscribed successfully" });
        } else {
            // If the subscription does not exist, create it (subscribe)
            const newSubscription = new Subscription({ userId, podcastId });
            await newSubscription.save();
            return res.status(201).json({ message: "Subscribed successfully" });
        }
    } catch (err) {
        next(err);
    }
};
