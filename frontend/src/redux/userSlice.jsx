import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    loading: false,
    error: null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload.user;
            localStorage.setItem('podifytoken', action.payload.token);
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            localStorage.removeItem('podifytoken');
        },
        logout: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('podifytoken');
        },
        verified: (state, action) => {
            if (state.currentUser) {
                state.currentUser.verified = action.payload;
            }
        },
        displayPodcastFailure: (state) => {
            state.loading = false;
            state.error = true;
        },
        subscription: (state, action) => {
            if (state.currentUser.subscribedUsers.includes(action.payload)) {
                state.currentUser.subscribedUsers.splice(
                    state.currentUser.subscribedUsers.findIndex(
                        (channelId) => channelId === action.payload
                    ),
                    1
                );
            } else {
                state.currentUser.subscribedUsers.push(action.payload);
            }
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, displayPodcastFailure, subscription, verified } =
    userSlice.actions;

export default userSlice.reducer;