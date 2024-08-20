import mongoose from "mongoose";

const SubscriptiontSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    podcastId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Podcasts",
        required: true,
    }
})

export default mongoose.model("Subscription", SubscriptiontSchema);