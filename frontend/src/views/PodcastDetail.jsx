import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import FavoriteIcon from '@mui/icons-material/Favorite';
import { CircularProgress, IconButton } from '@mui/material';
import { favoritePodcast, getPodcastById, getUsers, toggleSubscription } from '../api/server';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Avatar } from '@mui/material';
import { format } from 'timeago.js';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { EpisodeCard } from '../components/EpisodeCard'
import { toast } from 'sonner';

const Container = styled.div`
  padding: 20px 30px;
  padding-bottom: 200px;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Top = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  @media (max-width: 768px) {
    flex-direction: column; 
  }
`;

const Image = styled.img`
  width: 250px;
  height: 250px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.text_secondary};
  object-fit: cover;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text_primary};
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const Description = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
`;

const Tags = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
`;

const Tag = styled.div`
  background-color: ${({ theme }) => theme.text_secondary + 50};
  color: ${({ theme }) => theme.text_primary};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
`;


const Episodes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Topic = styled.div`
  color: ${({ theme }) => theme.text_primary};
  font-size: 22px;
  font-weight: 540;
  display: flex;
  justify-content space-between;
  align-items: center;
`;

const EpisodeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;


const Favorite = styled(IconButton)`
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    background: ${({ theme }) => theme.text_secondary + 95} !important;
    color: ${({ theme }) => theme.text_primary} !important;
`

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`
const Creator = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 12px;
`
const CreatorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const CreatorDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`
const Views = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 12px;
  margin-left: 20px;
`
const Icon = styled.div`
  color: white;
  font-size: 12px;
  margin-left: 20px;
  border-radius: 50%;
  background: #9000ff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
`

const SubscribeButton = styled.button`
  background-color: #ff5733 ;
  color: #ffffff;
  border: none;
  border-radius: 15px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 20px;
  &:hover {
    background-color: #0056b3;
  }
`

export const PodcastDetail = () => {
  const { id } = useParams();
  const [favourite, setFavourite] = useState(false);
  const [podcast, setPodcast] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState();
  const [subscribed, setSubscribed] = useState(false);

  const token = localStorage.getItem("podifytoken");
  const { currentUser } = useSelector(state => state.user);

  const favoritpodcast = async () => {
    setLoading(true);

    if (podcast !== undefined && podcast !== null) {
      try {
        const res = await favoritePodcast(podcast?._id, token);
        if (res.status === 200) {
          setFavourite(!favourite);
          setLoading(false);
          const message = favourite ? 
                    "Podcast unmarked as favorite successfully!" : 
                    "Podcast marked as favorite successfully!";
          toast.success(message)
        }
      } catch (err) {
        setLoading(false);
        let errorMessage = "Something went wrong";

        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "You are not authorized. Please log in.";
          } else if (err.response.status === 404) {
            errorMessage = "Podcast not found.";
          } else if (err.response.status === 500) {
            errorMessage = "Internal server error. Please try again later.";
          } else {
            errorMessage = `Error: ${err.response.status}. ${err.response.data.message}`;
          }
        } else if (err.request) {
          errorMessage = "No response from the server. Please check your network connection.";
        } else {
          errorMessage = "Error in setting up the request.";
        }

        toast.error(errorMessage)
      }
    } else {
      setLoading(false);
      toast.error('Invalid podcast data.')
    }
  };

  const getUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers(token);
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      toast.error('Failed to fetch user data')
    } finally {
      setLoading(false);
    }
  }, [token]);


  const getPodcast = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPodcastById(id);
      if (res.status === 200) {
        setPodcast(res.data);
        setLoading(false)
      } else {
        throw new Error(`Unexpected response status: ${res.status}`);
      }
    } catch (err) {
      console.error('Error fetching podcast data:', err);
      toast.error('Failed to fetch podcast data')
    }
  }, [id]);


  const isFavourite = useMemo(() => {
    return user?.favorits?.some((fav) => fav?._id === podcast?._id);
  }, [user, podcast]);


  useEffect(() => {
    setLoading(true);
    getPodcast().finally(() => setLoading(false));
  }, [getPodcast]);

  useEffect(() => {
    if (currentUser) {
      getUser();
    }

    if (isFavourite) {
      setFavourite(true);
    } else {
      setFavourite(false);
    }
  }, [currentUser, getUser, isFavourite]);

  const handleSubscriptionError = useCallback((err, defaultMessage) => {
    let errorMessage = defaultMessage;

    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = "You are not authorized. Please log in.";
      } else if (err.response.status === 404) {
        errorMessage = "Podcast not found.";
      } else if (err.response.status === 500) {
        errorMessage = "Internal server error. Please try again later.";
      } else {
        errorMessage = `Error: ${err.response.status}. ${err.response.data.message}`;
      }
    } else if (err.request) {
      errorMessage = "No response from the server. Please check your network connection.";
    } else {
      errorMessage = "Error in setting up the request.";
    }
    
    toast.error(errorMessage)
    console.error(err);
  }, []);
  
  const handleToggleSubscription = useCallback( async () => {
    setLoading(true);
    try {
      const res = await toggleSubscription(podcast?._id, token)
      if (res.data.message.includes('Unsubscribed')) {
        setSubscribed(false);
        toast.success('Successfully unsubscribed from the podcast.')
      } else {
        setSubscribed(true);
        toast.success('Successfully subscribed to the podcast.')
      }
    } catch (e) {
      handleSubscriptionError(e, 'Failed to toggle subscription');
    } finally {
      setLoading(false);
    }
  }, [handleSubscriptionError, podcast?._id, token])

  return (
    <Container>
      {loading ? (
        <Loader>
          <CircularProgress />
        </Loader>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <SubscribeButton onClick={() => handleToggleSubscription()}>
              {currentUser && loading ? (<CircularProgress color="inherit" size={20} />) : subscribed ? "Unsubscribe" : "Subscribe"}
            </SubscribeButton>
            <Favorite onClick={() => favoritpodcast()}>
              {favourite ?
                <FavoriteIcon style={{ color: "#E30022", width: '20px', height: '20px' }}></FavoriteIcon>
                :
                <FavoriteIcon style={{ width: '20px', height: '20px' }}></FavoriteIcon>
              }
            </Favorite>
          </div>
          <Top>
            <Image src={podcast?.thumbnail} />
            <Details>
              <Title>{podcast?.name}
              </Title>
              <Description>{podcast?.desc}</Description>
              <Tags>
                {podcast?.tags?.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Tags>
              <CreatorContainer>
                <CreatorDetails>
                  <Avatar src={podcast?.creator?.img} sx={{ width: "26px", height: "26px" }}>{podcast?.creator?.name.charAt(0).toUpperCase()}</Avatar>
                  <Creator>{podcast?.creator?.name}</Creator>
                </CreatorDetails>
                <Views>• {podcast?.views} Views</Views>
                <Views>
                  • {format(podcast?.createdAt)}
                </Views>
                <Icon>
                  {podcast?.type === "audio" ?
                    <HeadphonesIcon />
                    :
                    <PlayArrowIcon />
                  }
                </Icon>
              </CreatorContainer>
            </Details>
          </Top>
          <Episodes>
            <Topic>All Episodes</Topic>
            <EpisodeWrapper>
              {podcast?.episodes?.map((episode, index) => (
                <EpisodeCard key={index} episode={episode} podid={podcast} type={podcast.type} user={user} index={index} />
              ))}
            </EpisodeWrapper>
          </Episodes>
        </>
      )}
    </Container >
  )
}