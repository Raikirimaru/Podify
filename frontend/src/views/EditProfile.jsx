import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getUsers, updateUser } from "../api/server.js";
import { PhotoTwoTone } from '@mui/icons-material';
import { CircularProgress } from '@mui/material'
import { toast } from 'sonner'
import { useTranslation } from "react-i18next";


const ScrollableContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 20px;
    max-height: 100vh;
    overflow-y: auto;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    max-width: 400px;
`;

const Title = styled.div`
    font-size: 22px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    margin: 16px 28px;
`;

const Input = styled.input`
    height: 44px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.text_secondary};
    color: ${({ theme }) => theme.text_secondary};
    padding: 10px;
    font-size: 14px;
    background-color: transparent;
    outline: none;
`;

const Button = styled.button`
    padding: 15px;
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text_primary};
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1.3em;
    &:hover {
        background-color: ${({ theme }) => theme.primary_hover};
    }
`;

const FileUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const Label = styled.label`
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
`;

const FileUploadBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dashed ${({ theme }) => theme.border};
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    max-width: 400px;
    margin-top: 10px;
`;

const FileUploadText = styled.div`
    text-align: center;
    color: ${({ theme }) => theme.text_secondary};
`;

const UploadButton = styled.label`
    display: inline-block;
    padding: 8px 12px;
    margin-top: 10px;
    color: ${({ theme }) => theme.primary};
    border: 1px solid ${({ theme }) => theme.primary};
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        background-color: ${({ theme }) => theme.primary_hover};
        color: ${({ theme }) => theme.text_primary};
    }
`;

const HiddenInput = styled.input`
    display: none;
`;

const ImagePreview = styled.img`
    max-width: 100%;
    max-height: 200px;
    border-radius: 10px;
    margin-top: 10px;
`;

export function EditProfile() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [img, setImg] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { t } = useTranslation()
    const token = localStorage.getItem("podifytoken");

    useEffect(() => {
        const fetchUser = async () => {
            if (currentUser) {
                await getUsers(token).then((res) => {
                    setName(res.data.name);
                    setEmail(res.data.email);
                }).catch((error) => {
                    console.log(error);
                });
            }
        };
        fetchUser();
    }, [currentUser, token]);

    useEffect(() => {
        if (img) {
            const objectUrl = URL.createObjectURL(img);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [img]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !name) {
            //dispatch(openSnackbar({ message: "Name is required", severity: "error" }));
            toast.error(t('editProfile.nameRequired'))
            return;
        }

        if (!validateEmail(email)) {
            //dispatch(openSnackbar({ message: "Invalid email format", severity: "error" }));
            toast.error(t('editProfile.invalidEmail'))
            return;
        }

        if (img && img.size > 10 * 1024 * 1024) {
            //dispatch(openSnackbar({ message: "Image size should be less than 10MB", severity: "error" }));
            toast.error(t('editProfile.imageSizeError'))
            return;
        }
        const formData = new FormData()
        formData.append("name", name);
        formData.append("email", email);
        if (img) {
            formData.append("img", img);
        }
        setLoading(true)
        await updateUser(token, currentUser._id, formData).then((res) => {
            //dispatch(openSnackbar({ message: "Profile updated successfully", severity: "success" }));
            toast.success(t('editProfile.profileUpdatedSuccess'))
            navigate("/profile");
        }).catch((error) => {
            //dispatch(openSnackbar({ message: `Failed to update profile: ${error}`, severity: "error" }));
            toast.error(t('editProfile.profileUpdateFailed'))
            console.log(error);
        }).finally((done) => {
            setLoading(false)
        })
    };

    return (
        <ScrollableContainer>
            <Title>{t('editProfile.modifyProfile')}</Title>
            <Form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder={t('editProfile.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    type="email"
                    placeholder={t('editProfile.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <FileUploadContainer>
                    <Label htmlFor="cover-photo">{t('editProfile.pictureProfile')}</Label>
                    <FileUploadBox>
                        <FileUploadText>
                            {preview ? <ImagePreview src={preview} alt={"Preview"} /> : <PhotoTwoTone style={{ fontSize: '48px', color: '#ccc' }} />}
                            <div>
                                <UploadButton htmlFor="file-upload">
                                <span>{t('editProfile.uploadFile')}</span>
                                <HiddenInput
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    onChange={(e) => setImg(e.target.files[0])}
                                />
                                </UploadButton>
                            </div>
                            <p>{t('editProfile.dragAndDrop')}</p>
                            <p>{t('editProfile.fileRequirements')}</p>
                        </FileUploadText>
                    </FileUploadBox>
                </FileUploadContainer>
                <Button type="submit">
                    {loading ? (
                        <CircularProgress color="inherit" size={20} />
                    ) : (
                        t('editProfile.saveChanges')
                    )}
                </Button>
            </Form>
        </ScrollableContainer>
    );
}