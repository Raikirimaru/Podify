import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import styled from "styled-components";
import Avatar from '@mui/material/Avatar';
import { getUsers } from '../api/server.js';
import { PodcastCard } from '../components/PodcastCard.jsx';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProfileAvatar = styled.div`
    padding-left:3rem;
    @media (max-width: 768px) {
        padding-left:0rem;
    }
`;
const ProfileContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    @media (max-width: 768px) {
        align-items: center;
    }
`;
const ProfileName = styled.div`
    color: ${({ theme }) => theme.text_primary};
    font-size:34px;
    font-weight:500;
`;
const ProfileEmail = styled.div`
    color:#2b6fc2;
    font-size:14px;
    font-weight:400;
`;
const FilterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    ${({ box, theme }) => box && `
    background-color: ${theme.bg};
        border-radius: 10px;
        padding: 20px 30px;
    `}
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
    gap: 14px;
    padding: 18px 6px;
    @media (max-width: 550px){
        justify-content: center;
    }
`;
const ProfileMain = styled.div`
    padding: 20px 30px;
    padding-bottom: 200px;
    height: 100%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;
const UserDetails = styled.div`
    display flex;
    gap: 120px;
    @media (max-width: 768px) {
        width: fit-content;
        flex-direction: column; 
        gap: 20px;
        justify-content: center;
        align-items: center;
    }
`;
const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;
const ButtonContainer = styled.div`
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
    color: ${({ theme }) => theme.primary};
    border: 1px solid ${({ theme }) => theme.primary};
    border-radius: 12px;
    width: 100%;
    max-width: 150px;
    padding: 8px 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    &:hover{
        background-color: ${({ theme }) => theme.primary};
        color: ${({ theme }) => theme.text_primary};
    }
`;

const EditProfileButton = styled(ButtonContainer)`
    margin-top: 1rem;
    margin-left: -0.2rem;
`;

export const Profile = ({ setUploadOpen, setEpisodeUploadOpen }) => {
    const [user, setUser] = useState();
    const { currentUser } = useSelector(state => state.user);
    const [name, setName] = useState("");
    const { t } = useTranslation()

    const token = localStorage.getItem("podifytoken");

    useEffect(() => {
        const getUser = async () => {
            await getUsers(token).then((res) => {
                setUser(res.data);
                setName(res.data.name);
            }).catch((error) => {
                console.log(error);
            });
        };
    
        if (currentUser) {
            getUser();
        }
    }, [currentUser, token]);

    return (
        <ProfileMain>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <ButtonContainer onClick={() => {
                            if (typeof setEpisodeUploadOpen === 'function' && currentUser) {
                                setEpisodeUploadOpen(true);
                            }
                        }}>
                    {t('uploadEpisodes.addepisode')}
                </ButtonContainer>
            </div>
            <UserDetails>
                <ProfileAvatar>
                    <Avatar sx={{ height: 165, width: 165 , fontSize: '24px'}} src={user?.img}>{user?.name?.charAt(0).toUpperCase()}</Avatar>
                    <Link to="/edit-profile" style={{ textDecoration: "none" }}>
                        <EditProfileButton>{t('editProfile.modifyProfile')}</EditProfileButton>
                    </Link>
                </ProfileAvatar>
                <ProfileContainer>
                    <ProfileName>{name}</ProfileName>
                    <ProfileEmail>E-mail: {user?.email}</ProfileEmail>
                </ProfileContainer>
            </UserDetails>
            {currentUser && user?.podcasts?.length > 0 &&
                <FilterContainer box={true}>
                    <Topic>{t('dashboard.youruploads')}</Topic>
                    <Podcasts>
                        {user?.podcasts?.map((podcast) => (
                            <PodcastCard key={podcast?._id} podcast={podcast} user={user} />
                        ))}
                    </Podcasts>
                </FilterContainer>
            }
            {currentUser && user?.podcasts?.length === 0 &&
                <FilterContainer box={true} >
                    <Topic>{t('dashboard.youruploads')}</Topic>
                    <Container>
                        <ButtonContainer onClick={() => {
                            if (typeof setUploadOpen === 'function' && currentUser) {
                                setUploadOpen(true);
                            }
                        }}>
                            {t('menu.upload')}
                        </ButtonContainer>
                    </Container>
                </FilterContainer>
            }
            <FilterContainer box={true}>
                <Topic>{t('profile.your_Favorites')}
                </Topic>
                <Podcasts>
                    {user && user?.favorits?.map((podcast) => (
                        <PodcastCard key={podcast?._id} podcast={podcast} user={user} />
                    ))}
                </Podcasts>
            </FilterContainer>
        </ProfileMain>
    );
}