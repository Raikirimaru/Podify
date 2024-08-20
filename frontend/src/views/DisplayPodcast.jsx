import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPodcastByCategory, getMostPopularPodcast } from '../api/server.js';
import styled from 'styled-components';
import { PodcastCard } from '../components/PodcastCard.jsx';
import { useDispatch } from 'react-redux';
import { openSnackbar } from '../redux/snackbarSlice';
import { CircularProgress } from '@mui/material';

const DisplayMain = styled.div`
  display: flex;
  padding: 30px;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

const Topic = styled.div`
  color: ${({ theme }) => theme.text_primary};
  font-size: 24px;
  font-weight: 540;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Podcasts = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  gap: 10px;
  padding: 30px 0;
`;

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgLight};
  padding: 20px;
  border-radius: 6px;
  min-height: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const DisplayNo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.text_primary};
`;

export const DisplayPodcast = () => {
  
  const { type } = useParams();
  const [podcasts, setPodcasts] = useState([]);
  const [string, setString] = useState('');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchMostPopularPodcasts = useCallback(async () => {
    try {
      const res = await getMostPopularPodcast();
      setPodcasts(res.data);
    } catch (err) {
      dispatch(openSnackbar({ message: err.message, severity: 'error' }));
    }
  }, [dispatch]);

  const fetchPodcastsByCategory = useCallback(async () => {
    try {
      const res = await getPodcastByCategory(type);
      setPodcasts(res.data);
    } catch (err) {
      dispatch(openSnackbar({ message: err.message, severity: 'error' }));
    }
  }, [dispatch, type]);

  const fetchAllPodcasts = useCallback(async () => {
    setLoading(true);
    const formattedType = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    setString(formattedType);

    if (type === 'mostpopular') {
      await fetchMostPopularPodcasts();
    } else {
      await fetchPodcastsByCategory();
    }

    setLoading(false);
  }, [type, fetchMostPopularPodcasts, fetchPodcastsByCategory]);

  useEffect(() => {
    fetchAllPodcasts();
  }, [type, fetchAllPodcasts]);

  return (
    <DisplayMain>
      <Container>
        <Topic>{string}</Topic>
        {loading ? (
          <Loader>
            <CircularProgress />
          </Loader>
        ) : (
          <Podcasts>
            {podcasts?.length === 0 ? (
              <DisplayNo>No Podcasts</DisplayNo>
            ) : (
              podcasts.map(podcast => <PodcastCard key={podcast._id} podcast={podcast} />)
            )}
          </Podcasts>
        )}
      </Container>
    </DisplayMain>
  );
};
