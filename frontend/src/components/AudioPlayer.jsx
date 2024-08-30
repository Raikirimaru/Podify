import { SkipNextTwoTone, SkipPreviousTwoTone, VolumeUp } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { closePlayer, openPlayer, setCurrentTime } from '../redux/audioplayerSlice';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    width: 100%;
    background-color:  ${({ theme }) => theme.card};
    color: white;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 10px 0px;
    transition: all 0.5s ease;
    @media (max-width: 768px) {
        height: 60px;
        gap: 6px;
        padding: 4px 0px;
    }
    z-index: 999;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    margin-left: 20px;
    @media (max-width: 768px) {
        gap: 10px;
        margin-left: 10px;
    }
    flex: 0.2;
`;

const Image = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 6px;
    object-fit: cover;
    @media (max-width: 768px) {
        width: 34px;
        height: 34px;
    }
`;

const PodData = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.span`
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

const Artist = styled.span`
    font-size: 12px;
    margin-top: 3px;
`;

const Player = styled.div`
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 0.6;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 768px) {
        flex: 0.8;
    }
`;

const Controls = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 30px;
    @media (max-width: 768px) {
        gap: 10px;
        margin-right: 10px;
    }
`;

const Audio = styled.audio`
    height: 46px;
    width: 100%;
    font-size: 12px;
    @media (max-width: 768px) {
        height: 40px;
        font-size: 10px;
    }
`;

const IcoButton = styled(IconButton)`
    background-color: ${({ theme }) => theme.text_primary} !important;
    color: ${({ theme }) => theme.bg} !important;
    font-size: 60px !important;
    padding: 10px !important;
    @media (max-width: 768px) {
        font-size: 20px !important;
        padding: 4px !important;
    }
`;

const Sound = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 50%;
    flex: 0.2;
    max-width: 150px;
    justify-content: space-between;
    margin-right: 20px;
    @media (max-width: 768px) {
        display: none;
        margin-right: 10px;
    }
`;

const VolumeBar = styled.input.attrs({
    type: 'range',
    min: 0,
    max: 1,
    step: 0.1,
})`
    -webkit-appearance: none;
    width: 100%;
    height: 2px;
    border-radius: 10px;
    background-color: ${({ theme }) => theme.text_primary};
    outline: none;
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${({ theme }) => theme.primary};
        cursor: pointer;
    }
    &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${({ theme }) => theme.primary};;
        cursor: pointer;
    }
`;

export const AudioPlayer = ({ episode, podid, currenttime, index }) => {
    const [progressWidth, setProgressWidth] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        const handleCanPlay = () => {
            if (audioRef.current && isFinite(currenttime)) {
                audioRef.current.currentTime = currenttime;
            } else {
                console.warn('Invalid current time value:', currenttime);
              //   toast.warning(t('audioPlayer.invalidCurrentTime'));
            }
        };

        const handleError = (e) => {
            console.error('Audio error:', e);
            toast.error(t('audioPlayer.audioError'));
        };

        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('canplay', handleCanPlay);
            audio.addEventListener('error', handleError);
        }

        return () => {
            if (audio) {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('error', handleError);
            }
        };
    }, [currenttime, dispatch, t]);

    const handleTimeUpdate = () => {
        const duration = audioRef.current.duration;
        const currentTime = audioRef.current.currentTime;
        const progress = (currentTime / duration) * 100;
        setProgressWidth(progress);
        setDuration(duration);
        dispatch(
            setCurrentTime({
                currenttime: currentTime
            })
        )
    }

    const handleVolumeChange = (event) => {
        const volume = event.target.value;
        setVolume(volume);
        audioRef.current.volume = volume;
    };

    const goToNextPodcast = () => {
        if (podid.episodes.length === index + 1) {
            toast.info(t('audioPlayer.lastEpisode'));
            return
        }
        dispatch(closePlayer());
        setTimeout(() => {
            dispatch(
                openPlayer({
                    type: "audio",
                    podid: podid,
                    index: index + 1,
                    currenttime: 0,
                    episode: podid.episodes[index + 1]
                })
            )
        }, 10);
    }

    const goToPreviousPodcast = () => {
        if (index === 0) {
            toast.info(t('audioPlayer.firstEpisode'));
            return;
        }
        dispatch(closePlayer());
        setTimeout(() => {
            dispatch(
                openPlayer({
                    type: "audio",
                    podid: podid,
                    index: index - 1,
                    currenttime: 0,
                    episode: podid.episodes[index - 1]
                })
            )
        }, 10);
    }

    return (
        <Container>
            <Left>
                <Image src={podid?.thumbnail} />
                <PodData>
                    <Title>{episode?.name}</Title>
                    <Artist>{episode?.creator.name}</Artist>
                </PodData>
            </Left>

            <Player>
                <Controls>
                    <IcoButton onClick={goToPreviousPodcast}>
                        <SkipPreviousTwoTone />
                    </IcoButton>
                    <Audio
                        ref={audioRef}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={goToNextPodcast}
                        autoPlay
                        controls
                        src={episode?.file}
                    />
                    <IcoButton onClick={goToNextPodcast}>
                        <SkipNextTwoTone />
                    </IcoButton>
                </Controls>
            </Player>
            <Sound>
                <VolumeUp />
                <VolumeBar value={volume} onChange={handleVolumeChange} />
            </Sound>
        </Container>
    )
}