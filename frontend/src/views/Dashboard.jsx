import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getMostPopularPodcast, getUsers, getPodcastByCategory } from '../api/server.js';
import { useSelector } from 'react-redux';
import { PodcastCard } from '../components/PodcastCard';
import { CircularProgress } from '@mui/material';

const DashboardMain = styled.div`
    padding: 20px 30px;
    padding-bottom: 200px;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    @media (max-width: 768px) {
        padding: 6px 10px;
    }
`;

const FilterContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.bgLight};
    border-radius: 10px;
    padding: 20px 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, box-shadow 0.3s;
    &:hover {
        background-color: ${({ theme }) => theme.bg};
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
`;

const Topic = styled.div`
    color: ${({ theme }) => theme.text_primary};
    font-size: 24px;
    font-weight: 540;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const Span = styled.span`
    color: ${({ theme }) => theme.primary};
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    transition: color 0.2s ease-in-out;
    @media (max-width: 768px) {
        font-size: 14px;
    }
    &:hover {
        color: ${({ theme }) => theme.primary}; 
    }
`;

const Podcasts = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    padding: 18px 6px;
    justify-content: center;
    @media (min-width: 551px) {
        justify-content: flex-start;
    }
`;

const Loader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

export const Dashboard = ({ setSignInOpen }) => {
    const [mostPopular, setMostPopular] = useState([]);
    const [user, setUser] = useState();
    const [comedy, setComedy] = useState([]);
    const [news, setNews] = useState([]);
    const [sports, setsports] = useState([]);
    const [crime, setCrime] = useState([]);
    const [loading, setLoading] = useState(false);

    const { currentUser } = useSelector(state => state.user);
    const token = localStorage.getItem("podifytoken");

    const getUser = useCallback(async () => {
        try {
            const res = await getUsers(token);
            setUser(res.data);
        } catch (error) {
            console.log(error);
        }
    }, [token]);

    const getPopularPodcast = useCallback(async () => {
        try {
            const res = await getMostPopularPodcast();
            setMostPopular(res.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const getCommedyPodcasts = useCallback(async () => {
        try {
            const res = await getPodcastByCategory("comedy");
            setComedy(res.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const getNewsPodcasts = useCallback(async () => {
        try {
            const res = await getPodcastByCategory("news");
            setNews(res.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const getSportsPodcasts = useCallback(async () => {
        try {
            const res = await getPodcastByCategory("sports");
            setsports(res.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const getCrimePodcasts = useCallback(async () => {
        try {
            const res = await getPodcastByCategory("crime");
            setCrime(res.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const getallData = useCallback(async () => {
        setLoading(true);
        if (currentUser) {
            await getUser();
        }
        await Promise.all([
            getPopularPodcast(),
            getCommedyPodcasts(),
            getNewsPodcasts(),
            getCrimePodcasts(),
            getSportsPodcasts(),
        ]);
        setLoading(false);
    }, [currentUser, getUser, getPopularPodcast, getCommedyPodcasts, getNewsPodcasts, getCrimePodcasts, getSportsPodcasts]);

    useEffect(() => {
        getallData();
    }, [currentUser, getallData]);

    return (
        <DashboardMain>
            {loading ?
                <Loader>
                    <CircularProgress />
                </Loader>
                :
                <>
                    {currentUser && user?.podcasts?.length > 0 &&
                        <FilterContainer box={true}>
                            <Topic>Your Uploads
                                <Link to={`/profile`} style={{ textDecoration: "none" }}>
                                    <Span>Show All</Span>
                                </Link>
                            </Topic>
                            <Podcasts>
                                {user?.podcasts?.slice(0, 10).map((podcast) => (
                                    <PodcastCard podcast={podcast} user={user} setSignInOpen={setSignInOpen} key={podcast?._id} />
                                ))}
                            </Podcasts>
                        </FilterContainer>
                    }
                    <FilterContainer>
                        <Topic>Most Popular
                            <Link to={`/podcast/show/mostpopular`} style={{ textDecoration: "none" }}>
                                <Span>Show All</Span>
                            </Link>
                        </Topic>
                        <Podcasts>
                            {mostPopular?.slice(0, 10).map((podcast) => (
                                <PodcastCard podcast={podcast} user={user} setSignInOpen={setSignInOpen} key={podcast?._id} />
                            ))}
                        </Podcasts>
                    </FilterContainer>
                    <FilterContainer>
                        <Topic>Comedy
                            <Link to={`/podcast/show/comedy`} style={{ textDecoration: "none" }}>
                                <Span>Show All</Span>
                            </Link>
                        </Topic>
                        <Podcasts>
                            {comedy?.slice(0, 10).map((podcast) => (
                                <PodcastCard podcast={podcast} user={user} setSignInOpen={setSignInOpen} key={podcast?._id} />
                            ))}
                        </Podcasts>
                    </FilterContainer>
                    <FilterContainer>
                        <Link to={`/podcast/show/news`} style={{ textDecoration: "none" }}>
                            <Topic>News
                                <Span>Show All</Span>
                            </Topic>
                        </Link>
                        <Podcasts>
                            {news?.slice(0, 10).map((podcast) => (
                                <PodcastCard podcast={podcast} user={user} setSignInOpen={setSignInOpen} key={podcast?._id} />
                            ))}
                        </Podcasts>
                    </FilterContainer>
                    <FilterContainer>
                        <Link to={`/podcast/show/crime`} style={{ textDecoration: "none" }}>
                            <Topic>Crime
                                <Span>Show All</Span>
                            </Topic>
                        </Link>
                        <Podcasts>
                            {crime?.slice(0, 10).map((podcast) => (
                                <PodcastCard podcast={podcast} user={user} setSignInOpen={setSignInOpen} key={podcast?._id} />
                            ))}
                        </Podcasts>
                    </FilterContainer>
                    <FilterContainer>
                        <Link to={`/podcast/show/sports`} style={{ textDecoration: "none" }}>
                            <Topic>Sports
                                <Span>Show All</Span>
                            </Topic>
                        </Link>
                        <Podcasts>
                            {sports?.slice(0, 10).map((podcast) => (
                                <PodcastCard podcast={podcast} user={user} setSignInOpen={setSignInOpen} key={podcast?._id} />
                            ))}
                        </Podcasts>
                    </FilterContainer>
                </>
            }
        </DashboardMain>
    );
};