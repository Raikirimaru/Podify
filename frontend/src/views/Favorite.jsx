import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { PodcastCard } from '../components/PodcastCard';
import { CircularProgress } from '@mui/material';
import { getUsers } from '../api/server.js';
import { useTranslation } from 'react-i18next'

const Container = styled.div`
    padding: 20px 30px;
    padding-bottom: 200px;
    height: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Topic = styled.div`
    color: ${({ theme }) => theme.text_primary};
    font-size: 24px;
    font-weight: 540;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Loader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const FavouritesContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    padding: 18px 6px;
    @media (max-width: 550px){
        justify-content: center;
    }
`;

const DisplayNo = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    color: ${({ theme }) => theme.text_primary};
`;

export function Favorite() {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(false);
    const { currentUser } = useSelector(state => state.user);
    const { t } = useTranslation()
    const token = localStorage.getItem("podifytoken");

    const getUser = useCallback(async () => {
        try {
            const res = await getUsers(token);
            setUser(res.data);
        } catch (error) {
            console.log(error);
        }
    }, [token]);

    const getUserData = useCallback(async () => {
        if (currentUser) {
            setLoading(true);
            await getUser();
            setLoading(false);
        }
    }, [currentUser, getUser]);

    useEffect(() => {
        getUserData();
    }, [currentUser, getUserData]);

    return (
        <Container>
            <Topic>{t('Favorites.title')}</Topic>
            {loading ? (
                <Loader>
                    <CircularProgress />
                </Loader>
            ) : (
                <FavouritesContainer>
                    {user?.favorits?.length === 0 && <DisplayNo>{t('Favorites.NoFavorites')}</DisplayNo>}
                    {user && user?.favorits?.map((podcast) => (
                        <PodcastCard key={podcast?._id} podcast={podcast} user={user} />
                    ))}
                </FavouritesContainer>
            )}
        </Container>
    );
}
