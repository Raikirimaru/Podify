import axios from 'axios';

const API = axios.create({ baseURL: `${process.env.REACT_APP_API_URL}/api` }); 

//auth
export const signIn = async ({ email, password }) => await API.post('/auth/signin', { email, password });
export const signUp = async ({
    name,
    email,
    password,
}) => await API.post('/auth/signup', {
    name,
    email,
    password,
});

export const googleSignIn = async ({
    name,
    email,
    img,
}) => await API.post('/auth/google', {
    name,
    email,
    img,
});
export const findUserByEmail = async (email) => await API.get(`/auth/findbyemail?email=${email}`);
export const generateOtp = async (email, name, reason) => await API.get(`/auth/generateotp?email=${email}&name=${name}&reason=${reason}`);
export const verifyOtp = async (otp) => await API.get(`/auth/verifyotp?code=${otp}`);
export const resetPassword = async (email, password) => await API.patch(`/auth/forgetpassword`, {email, password});

//user api
export const getUsers = async (token) => await API.get('/user/get', { headers: { "Authorization" : `Bearer ${token}` },  withCredentials: true});
export const searchUsers = async (search, token) => await API.get(`user/search/${search}`, { headers: { "Authorization" : `Bearer ${token}` },  withCredentials: true});
export const updateUser = async (token, userId, formData) => {
    return await API.patch(`/user/update/${userId}`, formData, {
        headers: {
            "Authorization" : `Bearer ${token}`,
            "Content-Type" : "multipart/form-data",
        },
    });
};


//podcast api
export const createPodcast = async (podcast, token) => await API.post('/podcasts/create', podcast, { headers: { "Authorization" : `Bearer ${token}` },  withCredentials: true });
export const updatePodcast = async (id, data, token) => await API.patch(`/podcasts/${id}`, data, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, withCredentials: true })
export const getPodcasts = async () => await API.get('/podcasts/all');
export const getPodcastsByUserId = async (id) => await API.get(`/podcasts/get/user/${id}`)
export const addEpisodes = async (podcast, token) => await API.post('/podcasts/episode', podcast, { headers: { "Authorization" : `Bearer ${token}` },  withCredentials: true});
export const favoritePodcast = async (id, token) => await API.post(`/podcasts/favorit`, {id: id}, { headers: { "Authorization" : `Bearer ${token}` },  withCredentials: true});
export const getRandomPodcast = async () => await API.get('/podcasts/random');
export const getPodcastByTags = async (tags) => await API.get(`/podcasts/tags?tags=${tags}`);
export const getPodcastByCategory = async (category) => await API.get(`/podcasts/category?q=${category}`);
export const getMostPopularPodcast = async () => await API.get('/podcasts/mostpopular');
export const getPodcastById = async (id) => await API.get(`/podcasts/get/${id}`);
export const addView = async (id) => await API.post(`/podcasts/addview/${id}`);
export const searchPodcast = async (search) => await API.get(`/podcasts/search?q=${search}`);



// Subscription api methods
export const toggleSubscription = async (podcastId, token) => await API.post('/subscription/toggle', { podcastId }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, withCredentials: true }) 
export const subscribeToPodcast = async (id, token) => await API.post('/subscription/subscribe', { id: id }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
export const unsubscribeFromPodcast = async (id, token) => await API.post('/subscription/unsubscribe', { id: id }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
export const checkSubscription = async (id, token) => API.get(`/subscription/check?podcastId=${id}`, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } })