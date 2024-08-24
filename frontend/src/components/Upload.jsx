import { BackupRounded, CloseRounded, CloudDoneRounded } from '@mui/icons-material';
import { CircularProgress, LinearProgress, Modal } from "@mui/material";
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { app } from "../storage/firebase.js";
import { ImageSelector } from "./ImageSelector";
import { useDispatch } from "react-redux";
import { createPodcast } from '../api/server.js';
import { Category } from '../utils/Data';
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



export function Upload ({ setUploadOpen }) {
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

    const dispatch = useDispatch();

    const token = localStorage.getItem("podifytoken");

    const validateForm = () => {
        let valid = true;
        if (!podcast.name || typeof podcast.name !== 'string') {
            valid = false;
            toast.error("Name is required")
        }
        if (!podcast.desc || typeof podcast.desc !== 'string') {
            valid = false;
            toast.error("Description is required")
        }
        if (!Array.isArray(podcast.tags) || podcast.tags.length === 0) {
            valid = false;
            toast.error('At least one tag is required')
        }
        if (!podcast.category || typeof podcast.category !== 'string') {
            valid = false;
            toast.error("Category is required")
        }
        if (!podcast.thumbnail || typeof podcast.thumbnail !== 'string') {
            valid = false;
            toast.error("Thumbnail is required")
        }
        return valid;
    };

    const validateEpisodeForm = () => {
        let valid = true;
        podcast.episodes.forEach((episode) => {
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
        if (validateForm()) {
            setShowEpisode(true);
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
                        file: "",
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
                podcast.episodes[index].file.uploadProgress = Math.round(progress);
                setPodcast({ ...podcast, episodes: podcast.episodes });
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
            podcast.episodes[index].file = file;
            setPodcast({ ...podcast, episodes: podcast.episodes });
            uploadFile(file, index);
        } else {
            toast.error('Invalid file type, Please choose other file type available')
        }
    };

    const createpodcast = () => {
        if (validateEpisodeForm()) {
            setLoading(true);
            createPodcast(podcast, token)
                .then(() => {
                    setLoading(false);
                    const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Podcast' }), 2000));

                    toast.promise(promise, {
                        loading: 'Loading...',
                        success: (data) => {
                            return `${data.name} has been added`;
                        },
                        error: 'Error',
                    });
                    setUploadOpen(false);
                })
                .catch((error) => {
                    setLoading(false);
                    console.error(error.message);
                    toast.error('Error creating podcast')
                });
        }
    };
    
    useEffect(() => {
        if (podcast.episodes.length > 0 && podcast.episodes.every(episode => episode.file !== "" && episode.name !== "" && episode.desc !== "" && podcast.name !== "" && podcast.desc !== "" && podcast.tags !== "" && podcast.image !== "" && podcast.image !== undefined && podcast.image !== null)) {
            if (podcast.episodes.every(episode => episode.file.name === undefined))
                setCreateDisabled(false);
            else
                setCreateDisabled(true);
        }
    }, [podcast]);

    return (
        <Modal open={true} onClose={() => setUploadOpen(false)}>
            <Container>
                <Wrapper>
                    <CloseRounded
                        style={{
                            position: "absolute",
                            top: "24px",
                            right: "30px",
                            cursor: "pointer",
                        }}
                        onClick={() => setUploadOpen(false)}
                    />
                    <Title>Upload Podcast</Title>
                    {!showEpisode ? (
                        <>
                            <Label>Podcast Details:</Label>
                            <ImageSelector podcast={podcast} setPodcast={setPodcast} />
                            <OutlinedBox style={{ marginTop: "12px" }}>
                                <TextInput
                                    placeholder="Podcast Name*"
                                    type="text"
                                    value={podcast?.name}
                                    onChange={(e) => setPodcast({ ...podcast, name: e.target.value })}
                                />
                            </OutlinedBox>
                            <OutlinedBox style={{ marginTop: "6px" }}>
                                <Desc
                                    placeholder="Podcast Description* "
                                    name="desc"
                                    rows={5}
                                    value={podcast?.desc}
                                    onChange={(e) => setPodcast({ ...podcast, desc: e.target.value })}
                                />
                            </OutlinedBox>
                            <OutlinedBox style={{ marginTop: "6px" }}>
                                <Desc
                                    placeholder="Tags seperate by ,"
                                    name="tags"
                                    rows={4}
                                    value={podcast?.tags}
                                    onChange={(e) => setPodcast({ ...podcast, tags: e.target.value.split(",") })}
                                />
                            </OutlinedBox>
                            <div style={{ display: 'flex', gap: '0px', width: '100%' }}>
                                <OutlinedBox style={{ marginTop: "6px", width: '100%', marginRight: '0px' }}>
                                    <Select
                                        onChange={
                                            (e) => setPodcast({ ...podcast, type: e.target.value })
                                        }>
                                        <Option value="audio">Audio</Option>
                                        <Option value="video">Video</Option>
                                    </Select>
                                </OutlinedBox>
                                <OutlinedBox style={{ marginTop: "6px", width: '100%', marginLeft: '0px' }}>
                                    <Select
                                        value={podcast?.category || ""}
                                        onChange={(e) => setPodcast({ ...podcast, category: e.target.value })}
                                    >
                                        <Option value="" disabled hidden>Select Category</Option>
                                        {Category.map((category) => (
                                            <Option key={category?.name} value={category?.name}>{category?.name}</Option>
                                        ))}
                                    </Select>
                                </OutlinedBox>
                            </div>
                            <ButtonContainer>
                                <OutlinedBox
                                    button={true}
                                    activeButton
                                    style={{ marginTop: "6px", width: "100%", margin: 0 }}
                                    onClick={() => setUploadOpen(false)}
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
                                    <FileUpload for={"fileField" + index}>
                                        {podcast?.episodes[index]?.file === "" ? (
                                            <Uploading>
                                                <BackupRounded />
                                                Select Audio / Video
                                            </Uploading>
                                        ) : (
                                            <Uploading>
                                                {podcast?.episodes[index]?.file?.name === undefined ? (
                                                    <div style={{ color: 'green', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CloudDoneRounded sx={{ color: 'inherit' }} />
                                                        File Uploaded Successfully
                                                    </div>
                                                ) : (
                                                    <>
                                                        File: {podcast?.episodes[index]?.file?.name}
                                                        <LinearProgress
                                                            sx={{ borderRadius: "10px", height: 6, width: "100%" }}
                                                            variant="determinate"
                                                            value={podcast?.episodes[index]?.file.uploadProgress}
                                                            color={"success"}
                                                        />
                                                        {podcast?.episodes[index]?.file?.uploadProgress}% Uploaded
                                                    </>
                                                )}
                                            </Uploading>
                                        )}
                                    </FileUpload>
                                    <File style={{ marginTop: "16px" }} type="file" accept="file_extension|audio/*|video/*|media_type" id={"fileField" + index}
                                        onChange={(e) => handleFileChange(e, index)}
                                    />
                                    <OutlinedBox >
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
                                        Delete
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
                                    onClick={() => {
                                        !disabled && goToPodcast();
                                    }}
                                >
                                    Back
                                </OutlinedBox>
                                <OutlinedBox
                                    button={true}
                                    activeButton={!disabled}
                                    style={{ marginTop: "6px", width: "100%", margin: 0 }}
                                    onClick={() => {
                                        !disabled && createpodcast();
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress color="inherit" size={20} />
                                    ) : (
                                        "Create"
                                    )}
                                </OutlinedBox>
                            </ButtonContainer>
                        </>
                    )}
                </Wrapper>
            </Container>
        </Modal>
    )
}