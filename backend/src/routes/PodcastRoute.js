import express from 'express';
import { authenticate } from '../middlewares/VerifyToken.js'
import { addepisodes, getPodcastByUserId, getEpisode, getAllEpisodes, updateEpisode, deleteEpisode, addView, createPodcast, deletePodcast, updatePodcast, favoritPodcast, getByCategory, getByTag, getPodcastById, getPodcasts, mostpopular, random, search } from '../controllers/podcasts.js';

const router = express.Router();

//create a podcast
router.post("/create",authenticate, createPodcast);
//get all podcasts
router.get("/all", getPodcasts);
router.patch('/:id', authenticate, updatePodcast);
router.delete('/:id', authenticate, deletePodcast);
//get podcast by id
router.get("/get/:id", getPodcastById)
router.get("/get/user/:id", getPodcastByUserId)
//add episode to a 
router.post("/episode",authenticate, addepisodes);
router.get('/episode/:id', getEpisode);
router.get('/episodes', getAllEpisodes)
router.patch('/episode/:id', authenticate, updateEpisode);
router.delete('/episode/:id', authenticate, deleteEpisode);
//favorit/unfavorit podcast
router.post("/favorit",authenticate, favoritPodcast); 
//add view
router.post("/addview/:id", addView); 


//searches
router.get("/mostpopular", mostpopular)
router.get("/random", random)
router.get("/tags", getByTag)
router.get("/category", getByCategory)
router.get("/search", search)

export default router;