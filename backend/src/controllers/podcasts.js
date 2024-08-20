import Podcast from "../models/Podcast.js";
import User from "../models/User.js";
import Episode from "../models/Episode.js";
import { createError } from '../errors/error.js'
import Subscription from "../models/Subscription.js";



// podcasts crud
export const createPodcast = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        let episodeList = []
        if (Array.isArray(req.body.episodes)) {
            await Promise.all(req.body.episodes.map(async (item) => {
                const episode = new Episode({ creator: user.id, ...item });
                const savedEpisode = await episode.save();
                episodeList.push(savedEpisode._id);
            }));
        }

        // Create a new podcast
        const podcast = new Podcast(
            {
                creator: user.id, episodes: episodeList,
                name: req.body.name,
                desc: req.body.desc,
                thumbnail: req.body.thumbnail,
                tags: req.body.tags,
                type: req.body.type,
                category: req.body.category
            }
        );
        const savedPodcast = await podcast.save();

        //save the podcast to the user
        await User.findByIdAndUpdate(user.id, {
            $push: { podcasts: savedPodcast.id },
        }, { new: true });

        res.status(201).json(savedPodcast);
    } catch (err) {
        next(err);
    }
}

export const updatePodcast = async (req, res, next) => {
    try {
        const updatedPodcast = await Podcast.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedPodcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }

        res.status(200).json(updatedPodcast);
    } catch (err) {
        next(err);
    }
};

export const deletePodcast = async (req, res, next) => {
    try {
        const podcast = await Podcast.findById(req.params.id);

        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }

        await Episode.deleteMany({ _id: { $in: podcast.episodes } });

        await Podcast.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Podcast deleted successfully" });
    } catch (err) {
        next(err);
    }
};


// episodes crud
export const addepisodes = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (Array.isArray(req.body.episodes)) {
            await Promise.all(req.body.episodes.map(async (item) => {
                const { _id, ...episodeData } = item;
                const episode = new Episode({ creator: user.id, ...episodeData });
                const savedEpisode = await episode.save();

                await Podcast.findByIdAndUpdate(
                    req.body.podid, {
                    $push: { episodes: savedEpisode.id },
                }, { new: true }
                );

                const subscriptions = await Subscription.find({ podcastId: req.body.podid }).populate('userId');

                subscriptions.forEach(sub => {
                    req.io.to(sub.userId._id.toString()).emit('new_episode', {
                        message: `new episode added : ${savedEpisode.name}`,
                        podcastId: req.body.podid,
                        episodeId: savedEpisode.id,
                        date: new Date()
                    })
                })
            }))
        }

        res.status(201).json({ message: "Episode added successfully" });

    } catch (err) {
        console.error("Error in addepisodes function:", err);
        next(err);
    }
};


export const getEpisode = async (req, res, next) => {
    try {
        const episode = await Episode.findById(req.params.id).populate('creator', 'name email');
        if (!episode) {
            return res.status(404).json({ message: "Episode not found" });
        }
        res.status(200).json({ message: "Episode get successfully" });
    } catch (err) {
        next(err);
    }
};

export const getAllEpisodes = async (req, res, next) => {
    try {
        const episodes = await Episode.find().populate('creator', 'name email');
        if (!episodes) {
            return res.status(404).json({ message: "Episode not found" });
        }
        res.status(200).json({ message: "Episode successfully found and added successfully to the list of episodes"});
    } catch (err) {
        next(err);
    }
};

export const updateEpisode = async (req, res, next) => {
    try {
        const updatedEpisode = await Episode.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEpisode) {
            return res.status(404).json({ message: "Episode not found" });
        }

        res.status(200).json({ message: "Episode updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const deleteEpisode = async (req, res, next) => {
    try {
        const deletedEpisode = await Episode.findByIdAndDelete(req.params.id);

        if (!deletedEpisode) {
            return res.status(404).json({ message: "Episode not found" });
        }

        await Podcast.findByIdAndUpdate(
            req.body.podid, {
            $pull: { episodes: req.params.id },
        });

        res.status(200).json({ message: "Episode deleted successfully" });
    } catch (err) {
        next(err);
    }
};


export const getPodcasts = async (req, res, next) => {
    try {
        // Get all podcasts from the database
        const podcasts = await Podcast.find().populate("creator", "name img").populate("episodes");
        return res.status(200).json(podcasts);
    } catch (err) {
        next(err);
    }
};

export const getPodcastByUserId = async (req, res, next) => {
    try {
        const userId = req.params.id
        const podcasts = await Podcast.find({ creator: userId }).populate("episodes")

        if (!podcasts.length) {
            return res.status(404).send({ message: 'No podcasts found for this user.' })
        }
        res.status(200).json(podcasts)
    } catch (e) {
        res.status(500).json({ message: "An error occurred while retrieving the podcasts." })
        next(e)
    }
}

export const getPodcastById = async (req, res, next) => {
    try {
        // Get the podcasts from the database
        const podcast = await Podcast.findById(req.params.id).populate("creator", "name img").populate("episodes");
        return res.status(200).json(podcast);
    } catch (err) {
        next(err);
    }
};

export const favoritPodcast = async (req, res, next) => {
    // Check if the user is the creator of the podcast
    const user = await User.findById(req.user.id);
    const podcast = await Podcast.findById(req.body.id);
    let found = false;
    if (user.id === podcast.creator) {
        return next(createError(403, "You can't favorit your own podcast!"));
    }

    // Check if the podcast is already in the user's favorits
    await Promise.all(user.favorits.map(async (item) => {
        if (req.body.id == item) {
            //remove from favorite
            found = true;
            console.log("this")
            await User.findByIdAndUpdate(user.id, {
                $pull: { favorits: req.body.id },

            }, { new: true })
            res.status(200).json({ message: "Removed from favorit" });

        }
    }));


    if (!found) {
        await User.findByIdAndUpdate(user.id, {
            $push: { favorits: req.body.id },
        }, { new: true });
        res.status(200).json({ message: "Added to favorit" });
    }
}


//add view 
export const addView = async (req, res, next) => {
    try {
        await Podcast.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
        });
        res.status(200).json("The view has been increased.");
    } catch (err) {
        next(err);
    }
};

//searches
export const random = async (req, res, next) => {
    try {
        const podcasts = await Podcast.aggregate([{ $sample: { size: 40 } }]).populate("creator", "name img").populate("episodes");
        res.status(200).json(podcasts);
    } catch (err) {
        next(err);
    }
};

export const mostpopular = async (req, res, next) => {
    try {
        const podcast = await Podcast.find().sort({ views: -1 }).populate("creator", "name img").populate("episodes");
        res.status(200).json(podcast);
    } catch (err) {
        next(err);
    }
};

export const getByTag = async (req, res, next) => {
    const tags = req.query.tags.split(",");
    try {
        const podcast = await Podcast.find({ tags: { $in: tags } }).populate("creator", "name img").populate("episodes");
        res.status(200).json(podcast);
    } catch (err) {
        next(err);
    }
};

export const getByCategory = async (req, res, next) => {
    const query = req.query.q;
    try {
        const podcast = await Podcast.find({ 
            category: { $regex: query, $options: "i" },
        }).populate("creator", "name img").populate("episodes");
        res.status(200).json(podcast);
    } catch (err) {
        next(err);
    }
};

export const search = async (req, res, next) => {
    const query = req.query.q;
    try {
        const podcast = await Podcast.find({
            name: { $regex: query, $options: "i" },
        }).populate("creator", "name img").populate("episodes").limit(40);
        res.status(200).json(podcast);
    } catch (err) {
        next(err);
    }
};