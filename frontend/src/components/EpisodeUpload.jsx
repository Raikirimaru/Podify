import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { CircularProgress, Modal } from '@mui/material';
import { BackupRounded, CloseRounded, CloudDoneRounded } from '@mui/icons-material';
import { toast } from 'sonner';
import { addEpisodes, getPodcastById, getPodcastsByUserId } from '../api/server.js';
import { CircularProgressWithLabel } from '../components/CircularProgressWithLabel.jsx'
import { app } from "../storage/firebase.js";
import { useSelector } from 'react-redux';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

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
`;

const Wrapper = styled.div`
    max-width: 500px;
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
`;

const Title = styled.div`
    font-size: 22px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    margin: 12px 20px;
`;

const TextInput = styled.input`
    width: 100%;
    border: none;
    font-size: 14px;
    border-radius: 3px;
    background-color: transparent;
    outline: none;
    color: ${({ theme }) => theme.text_secondary};
`;

const Desc = styled.textarea`
    width: 100%;
    border: none;
    font-size: 14px;
    border-radius: 3px;
    background-color: transparent;
    outline: none;
    padding: 10px 0px;
    color: ${({ theme }) => theme.text_secondary};
`;


const Label = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary + 80};
    margin: 12px 20px 0px 20px;
`;


const OutlinedBox = styled.div`
    min-height: 48px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.text_secondary};
    color: ${({ theme }) => theme.text_secondary};
    ${({ googleButton, theme }) =>
            googleButton &&
            `
        user-select: none; 
    gap: 16px;`}
    ${({ button, theme }) =>
            button &&
            `
        user-select: none; 
        border: none;
        font-weight: 600;
        font-size: 16px;
        background: ${theme.button};
        color:'${theme.bg}';`}
        ${({ activeButton, theme }) =>
            activeButton &&
            `
        user-select: none; 
        border: none;
        background: ${theme.primary};
        color: white;`}
    margin: 3px 20px;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 14px;
`;

const Select = styled.select`
    width: 100%;
    border: none;
    font-size: 14px;
    border-radius: 3px;
    background-color: transparent;
    outline: none;
    color: ${({ theme }) => theme.text_secondary};
`;

const Option = styled.option`
    width: 100%;
    border: none;
    font-size: 14px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.card};
    outline: none;
    color: ${({ theme }) => theme.text_secondary};
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 0px;
    margin: 6px 20px 20px 20px;
    align-items: center;
    gap: 12px;
`;

const FileUpload = styled.label`
    display: flex;
    min-height: 48px;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 16px 20px 3px 20px;
    border: 1px dashed ${({ theme }) => theme.text_secondary};
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    color: ${({ theme }) => theme.text_secondary};
    &:hover {
        background-color: ${({ theme }) => theme.text_secondary + 20};
    }
        .progress-container {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .progress-label {
            margin-left: 8px;
            font-weight: bold;
        }

        .progress-bar {
            flex-grow: 1;
        }
    }
`;


const File = styled.input`
    display: none;
`;

const Uploading = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px;
`;

export function EpisodeUpload({ setEpisodeUploadOpen }) {
    const [podcast, setPodcast] = useState({
        name: "",
        desc: "",
        thumbnail: "",
        tags: [],
        category: "",
        type: "audio",
        episodes: [
            {
                name: "",
                desc: "",
                type: "audio",
                file: "",
            }
        ],
    });
    const [showEpisode, setShowEpisode] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [createDisabled, setCreateDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [availablePodcasts, setAvailablePodcasts] = useState([]);
    const [selectedPodcast, setSelectedPodcast] = useState("");
    const { currentUser } = useSelector(state => state.user);

    const dispatch = useDispatch();
    const token = localStorage.getItem("podifytoken");

    useEffect(() => {
        if (currentUser && currentUser?._id) {
            getPodcastsByUserId(currentUser?._id)
                .then(response => {
                    if (response?.data && response?.data?.length > 0) {
                        setAvailablePodcasts(response?.data);
                    } else {
                        toast.info('Not podcasts published by this user.')
                    }
                })
                .catch(error => {
                    toast.info('Not found podcasts')
                    console.error(error.message)
                });
        }
    }, [dispatch, token, currentUser]);


    useEffect(() => {
        if (selectedPodcast) {
            getPodcastById(selectedPodcast)
                .then(response => {
                    if (response.data) {
                        setPodcast(response.data);
                        setShowEpisode(true);
                    }
                })
                .catch(error => {
                    toast.error('Error fetching podcast details')
                    console.error(error.message)
                });
        }
    }, [dispatch, selectedPodcast, token]);

    const validateForm = () => {
        if (!podcast) {
            toast.error('Podcast data is missing')
            return false;
        }
    
        if (!podcast?.episodes || podcast?.episodes?.length === 0) {
            toast.error('At least one episode is required')
            return false;
        }
    
        if (!podcast.name) {
            toast.error('Podcast name is required')
            return false;
        }
    
        if (!podcast.desc) {
            toast.error('Podcast description is required')
            return false;
        }
        return true;
    };    
    
    const validateEpisodeForm = () => {
        let valid = true;
        podcast?.episodes?.forEach((episode) => {
            if (!episode.name) {
                valid = false;
                toast.error('Episode name is required')
            }
            if (!episode.desc) {
                valid = false;
                toast.error('Episode description is required')
            }
            if (!episode.file) {
                valid = false;
                toast.error('Episode file is required')
            }
        });
        return valid;
    };

    const goToAddEpisodes = () => {
        console.log("Attempting to go to add episodes...");
        if (validateForm()) {
            console.log("Form is valid. Switching to add episodes...");
            setShowEpisode(true);
        } else {
            console.log("Form is invalid. Cannot switch to add episodes.");
        }
    };    

    const goToPodcast = () => {
        setShowEpisode(false);
    };

    useEffect(() => {
        if (podcast === null) {
            setDisabled(true);
            setPodcast({
                name: "",
                desc: "",
                thumbnail: "",
                tags: [],
                episodes: [
                    {
                        name: "",
                        desc: "",
                        type: "audio",
                        file: { uploadProgress: 0, name: '' },
                    }
                ],
            });
        } else {
            if (podcast.name === "" && podcast.desc === "") {
                setDisabled(true);
            } else {
                setDisabled(false);
            }
        }
    }, [podcast]);

    const uploadFile = (file, index) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const updatedEpisodes = podcast.episodes.map((episode, i) =>
                    i === index ? { ...episode, file: { ...episode.file, uploadProgress: Math.round(progress), name: file.name } } : episode
                );
                setPodcast({ ...podcast, episodes: updatedEpisodes });
    
                switch (snapshot.state) {
                    case "paused":
                        toast.message('paused')
                        console.log("Upload is paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                    default:
                        break;
                }
            },
            (error) => { 
                console.error("Error uploading file:", error);
                toast.error('Error uploading file')
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const updatedEpisodes = podcast.episodes.map((episode, i) =>
                        i === index ? { ...episode, file: downloadURL } : episode
                    );
                    setPodcast({ ...podcast, episodes: updatedEpisodes });
                });
            }
        );
    };
    
    const validateFile = (file) => {
        const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "video/mp4", "video/ts", "video/avi"];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload an audio or video file.')
            return false;
        }
        if (file.size > 50000000) {
            toast.error('File size too large. Please upload a file smaller than 50MB.')
            return false;
        }
        return true;
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (validateFile(file)) {
            const updatedEpisodes = [...podcast.episodes];
            updatedEpisodes[index] = { ...updatedEpisodes[index], file: { uploadProgress: 0, name: file.name } };
            setPodcast({ ...podcast, episodes: updatedEpisodes });
            uploadFile(file, index);
        } else {
            toast.error('Invalid file type')
        }
    };
    

    const add_episode_in_podcast = () => {
        if (validateEpisodeForm()) {
            setLoading(true);
            const podcastData = { episodes: podcast.episodes, podid: selectedPodcast };
            addEpisodes(podcastData, token)
                .then(() => {
                    setLoading(false);
                    getPodcastById(selectedPodcast).then(response => {
                        if (response?.data) {
                            setPodcast(response?.data)
                            const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Episode' }), 2000));

                            toast.promise(promise, {
                                loading: 'Loading...',
                                success: (data) => {
                                    return `${data.name} has been added`;
                                },
                                error: 'Error',
                            });
                        }
                    }).catch(error => {
                        toast.error('Error fetching updated podcast details')
                        console.error(error.message);
                    });
                    setEpisodeUploadOpen(false);
                })
                .catch((error) => {
                    setLoading(false);
                    toast.error('Error adding episodes')
                    console.error(error.message)
                });
        }
    };

    useEffect(() => {
        const numberOfEpisodes = Array.isArray(podcast.episodes) ? podcast.episodes.length : 0;
        if (numberOfEpisodes > 0 && podcast.episodes.every(episode => episode.file !== "" && episode.name !== "" && episode.desc !== "" && podcast.name !== "" && podcast.desc !== "" && podcast.tags !== "" && podcast.thumbnail !== "" && podcast.thumbnail !== undefined && podcast.thumbnail !== null)) {
            if (podcast.episodes.every(episode => episode.file.name === undefined))
                setCreateDisabled(false);
            else
                setCreateDisabled(true);
        }
    }, [podcast]);

    return (
        <Modal open={true} onClose={() => setEpisodeUploadOpen(false)}>
            <Container>
                <Wrapper>
                    <CloseRounded
                        style={{
                            position: "absolute",
                            top: "24px",
                            right: "30px",
                            cursor: "pointer",
                        }}
                        onClick={() => setEpisodeUploadOpen(false)}
                    />
                    <Title>Upload Episodes</Title>
                    {!showEpisode ? (
                        <>
                            <Label>Select Podcast:</Label>
                            <OutlinedBox>
                                <Select
                                    value={selectedPodcast}
                                    onChange={(e) => setSelectedPodcast(e.target.value)}
                                >
                                    <Option value="" disabled hidden>Select Podcast</Option>
                                    {availablePodcasts.map(podcast => (
                                        <Option key={podcast?._id} value={podcast?._id}>{podcast?.name}</Option>
                                    ))}
                                </Select>
                            </OutlinedBox>
                            <ButtonContainer>
                                <OutlinedBox
                                    button={true}
                                    activeButton
                                    style={{ marginTop: "6px", width: "100%", margin: 0 }}
                                    onClick={() => setEpisodeUploadOpen(false)}
                                >
                                    Cancel
                                </OutlinedBox>
                                <OutlinedBox
                                    button={true}
                                    activeButton={!disabled}
                                    style={{ marginTop: "6px", width: "100%", margin: 0 }}
                                    onClick={() => {
                                        !disabled && goToAddEpisodes();
                                    }}
                                >
                                    Next
                                </OutlinedBox>
                            </ButtonContainer>
                        </>
                    ) : (
                        <>
                            <Label>Episode Details:</Label>
                            {podcast?.episodes?.map((episode, index) => (
                                <React.Fragment key={episode?._id || index}>
                                    <FileUpload htmlFor={"fileField" + index}>
                                        {episode?.file === "" ? (
                                            <Uploading>
                                                <BackupRounded />
                                                Select Audio / Video
                                            </Uploading>
                                        ) : (
                                            <Uploading>
                                                {episode?.file?.name === undefined ? (
                                                        <>
                                                            <div style={{ color: 'green', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                                                                <CloudDoneRounded sx={{ color: 'inherit' }} />
                                                                File Uploaded Successfully
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            File: {episode?.file?.name}
                                                                {episode?.file?.uploadProgress !== undefined && (
                                                                    <>
                                                                        <CircularProgressWithLabel key={index} value={episode?.file?.uploadProgress} />
                                                                    </>
                                                                )}
                                                        </>
                                                    )}
                                            </Uploading>
                                        )}
                                    </FileUpload>
                                    <File style={{ marginTop: "16px" }} type="file" accept="file_extension|audio/*|video/*|media_type" id={"fileField" + index}
                                        onChange={(e) => handleFileChange(e, index)}
                                    />
                                    <OutlinedBox>
                                        <TextInput
                                            placeholder="Episode Name*"
                                            type="text"
                                            value={episode?.name}
                                            onChange={(e) => {
                                                const newEpisodes = podcast?.episodes;
                                                newEpisodes[index].name = e.target.value;
                                                setPodcast({ ...podcast, episodes: newEpisodes });
                                            }}
                                        />
                                    </OutlinedBox>
                                    <OutlinedBox style={{ marginTop: "6px" }}>
                                        <Desc
                                            placeholder="Episode Description* "
                                            name="desc"
                                            rows={5}
                                            value={episode?.desc}
                                            onChange={(e) => {
                                                const newEpisodes = podcast?.episodes;
                                                newEpisodes[index].desc = e.target.value;
                                                setPodcast({ ...podcast, episodes: newEpisodes });
                                            }}
                                        />
                                    </OutlinedBox>
                                    <OutlinedBox
                                        button={true}
                                        activeButton={false}
                                        style={{ marginTop: "6px", marginBottom: "12px" }}
                                        onClick={() =>
                                            setPodcast({
                                                ...podcast, episodes: podcast?.episodes?.filter((_, i) => i !== index)
                                            })
                                        }
                                    >
                                        Remove
                                    </OutlinedBox>
                                </React.Fragment>
                            ))}
                            <OutlinedBox
                                button={true}
                                activeButton
                                style={{ marginTop: "4px", marginBottom: "18px" }}
                                onClick={() =>
                                    setPodcast({ ...podcast, episodes: [...podcast?.episodes, { name: "", desc: "", file: "" }] })
                                }
                            >
                                Add Episode
                            </OutlinedBox>
                            <ButtonContainer>
                                <OutlinedBox
                                    button={true}
                                    activeButton={false}
                                    style={{ marginTop: "6px", width: "100%", margin: 0 }}
                                    onClick={() => goToPodcast()}
                                >
                                    Back
                                </OutlinedBox>
                                <OutlinedBox
                                    button={true}
                                    activeButton={!createDisabled}
                                    style={{ marginTop: "6px", width: "100%", margin: 0 }}
                                    onClick={() => add_episode_in_podcast()}
                                >
                                    {loading ? <CircularProgress size={20} /> : "Save"}
                                </OutlinedBox>
                            </ButtonContainer>
                        </>
                    )}
                </Wrapper>
            </Container>
        </Modal>
    );
}
