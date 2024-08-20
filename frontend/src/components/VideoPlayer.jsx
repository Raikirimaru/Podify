import { CloseRounded } from '@mui/icons-material';
import { Modal } from '@mui/material';
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { closePlayer, openPlayer, setCurrentTime } from '../redux/audioplayerSlice';
import { openSnackbar } from '../redux/snackbarSlice';
import { toast } from 'sonner';

const Container = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #000000a7;
    display: flex;
    align-items: top;
    justify-content: center;
    overflow-y: scroll;
    transition: all 0.5s ease;
`;

const Wrapper = styled.div`
    max-width: 800px;
    width: 100%;
    border-radius: 16px;
    margin: 50px 20px;
    height: min-content;
    background-color: ${({ theme }) => theme.card};
    color: ${({ theme }) => theme.text_primary};
    padding: 10px;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 10px;
`;

const Videoplayer = styled.video`
    height: 100%;
    max-height: 500px;
    border-radius: 16px;
    margin: 0px 20px;
    object-fit: cover;
    margin-top: 30px;
`;

const EpisodeName = styled.div`
    font-size: 18px;    
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    margin: 12px 20px 0px 20px;
`;

const EpisodeDescription = styled.div`
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.text_secondary};
    margin: 6px 20px 20px 20px;
`;

const BtnContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 12px 20px 20px 20px;
    gap: 14px;
`;

const Btn = styled.div`
    border: none;
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    width: 100%;
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text_primary};
    padding: 14px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    &:hover {
        background-color: ${({ theme }) => theme.card_hover};
    }
`;

export const VideoPlayer = ({ episode, podid, currenttime, index }) => {
    const dispatch = useDispatch();
    const videoref = useRef(null);

    useEffect(() => {
        const handleCanPlay = () => {
            if (videoref.current && isFinite(currenttime)) {
                videoref.current.currentTime = currenttime;
            } else {
                console.error('Invalid currenttime value:', currenttime);
                toast.error('Invalid current time value provided')
            }
        };

        const handleError = (e) => {
            console.error('Video error:', e);
            toast.error('Error loading video. Please check your connection.')
        };

        const video = videoref.current;
        if (video) {
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('error', handleError);
        }

        return () => {
            if (video) {
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('error', handleError);
            }
        };
    }, [currenttime, dispatch]);

    const handleTimeUpdate = () => {
        const currentTime = videoref.current.currentTime;
        dispatch(
            setCurrentTime({
                currenttime: currentTime
            })
        );
    };

    const goToNextPodcast = () => {
        if (podid.episodes.length === index + 1) {
            toast.info('This is the last episode')
            return;
        }
        dispatch(closePlayer());
        setTimeout(() => {
            dispatch(
                openPlayer({
                    type: "video",
                    podid: podid,
                    index: index + 1,
                    currenttime: 0,
                    episode: podid.episodes[index + 1]
                })
            );
        }, 10);
    };

    const goToPreviousPodcast = () => {
        if (index === 0) {
            toast.info('This is the first episode')
            return;
        }
        dispatch(closePlayer());
        setTimeout(() => {
            dispatch(
                openPlayer({
                    type: "video",
                    podid: podid,
                    index: index - 1,
                    currenttime: 0,
                    episode: podid.episodes[index - 1]
                })
            );
        }, 10);
    };

    return (
        <Modal open={true} onClose={() => dispatch(closePlayer())}>
            <Container>
                <Wrapper>
                    <CloseRounded
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "20px",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            dispatch(closePlayer());
                        }}
                    />
                    <Videoplayer
                        controls
                        ref={videoref}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => goToNextPodcast()}
                        autoPlay
                        onPlay={() => {
                            if (isFinite(currenttime)) {
                                videoref.current.currentTime = currenttime;
                            } else {
                                console.error('Invalid currenttime value on play:', currenttime);
                                dispatch(
                                    openSnackbar({
                                        message: 'Invalid current time value on play',
                                        severity: 'error',
                                    })
                                );
                            }
                        }}
                    >
                        <source src={episode.file} type="video/mp4" />
                        <source src={episode.file} type="video/webm" />
                        <source src={episode.file} type="video/ogg" />
                        Your browser does not support the video tag.
                    </Videoplayer>
                    <EpisodeName>{episode.name}</EpisodeName>
                    <EpisodeDescription>{episode.desc}</EpisodeDescription>
                    <BtnContainer>
                        <Btn onClick={() => goToPreviousPodcast()}>Previous</Btn>
                        <Btn onClick={() => goToNextPodcast()}>Next</Btn>
                    </BtnContainer>
                </Wrapper>
            </Container>
        </Modal>
    );
};