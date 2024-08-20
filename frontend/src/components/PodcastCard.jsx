import React, { useState } from 'react'
import styled from 'styled-components'
import { IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { openSignin } from '../redux/setSigninSlice';
import { favoritePodcast } from '../api/server.js';
import FavoriteIcon from '@mui/icons-material/Favorite'
import Avatar from '@mui/material/Avatar'
import { HeadphonesTwoTone, PlayArrowTwoTone } from '@mui/icons-material'

const PlayIcon = styled.div`
    padding: 10px;
    border-radius: 50%;
    z-index: 100;
    display: flex;
    align-items: center;
    background: #9000ff !important;
    color: white !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    position: absolute !important;
    top: 45%;
    right: 10%;
    display: none;
    transition: all 0.4s ease-in-out;
    box-shadow: 0 0 16px 4px #9000ff50 !important;
`



const Card = styled(Link)`
    position: relative;
    text-decoration: none;
    background-color: ${({ theme }) => theme.card};
    max-width: 220px;
    height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 16px;
    border-radius: 6px;  
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.1);
    &:hover{
        cursor: pointer;
        transform: translateY(-8px);
        transition: all 0.4s ease-in-out;
        box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.3);
        filter: brightness(1.3);
    }
    &:hover ${PlayIcon}{
        display: flex;
    }
`

const Top = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    position: relative;
`
const Title = styled.div`
    overflow: hidden;
    display: -webkit-box;
    max-width: 100%;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${({ theme }) => theme.text_primary};
`

const Desc = styled.div`
    overflow: hidden;
    display: -webkit-box;
    max-width: 100%;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 12px;
`

const CardImage = styled.img`
    object-fit: cover;
    width: 220px;
    height: 140px;
    border-radius: 6px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    &:hover{
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
    }
`
const CardInfo = styled.div`
    display:flex;
    align-items: flex-end;
    font-weight:450;
    padding: 14px 0px 0px 0px;
    width: 100%;
`
const MainInfo = styled.div`
    display: flex;
    width: 100%;
    flex-direction:column;
    justify-content: flex-start;
    gap: 4px;
`

const AuthorInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 6px;
`
const AuthorName = styled.div`
    font-size:12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: ${({ theme }) => theme.text_secondary};
`

const Views = styled.div`
    font-size:10px;
    color: ${({ theme }) => theme.text_secondary};
    width: max-content;
`
const Favorite = styled(IconButton)`
    color:white;
    top: 8px;
    right: 6px;
    padding: 6px !important;
    border-radius: 50%;
    z-index: 100;
    display: flex;
    align-items: center;
    background: ${({ theme }) => theme.text_secondary + 95} !important;
    color: white !important;
    position: absolute !important;
    backdrop-filter: blur(4px);
    box-shadow: 0 0 16px 6px #222423 !important;
`

export const PodcastCard = ({ podcast, user, setSignInOpen }) => {
    const [favourite, setFavourite] = useState(false)
    const dispatch = useDispatch();

    const token = localStorage.getItem("podifytoken");

    const favoritpodcast = async () => {
        await favoritePodcast(podcast._id, token).then((res) => {
            if (res.status === 200) {
                setFavourite(!favourite)
            }
        }
        ).catch((err) => {
            console.log(err)
        })
    }

    React.useEffect(() => {
        //favorits is an array of objects in which each object has a podcast id match it to the current podcast id
        if (user?.favorits?.find((fav) => fav._id === podcast._id)) {
            setFavourite(true)
        }
    }, [podcast._id, user])

    const { currentUser } = useSelector(state => state.user);
    return (
        <Card to={`/podcast/${podcast._id}`}>
            <React.Fragment>
                <Top>
                    <Link onClick={() => {
                        if (!currentUser) {
                            dispatch(
                                openSignin()
                            )
                        } else {
                            favoritpodcast()
                        }
                    }}>
                        <Favorite >
                            {favourite ?
                                <FavoriteIcon style={{ color: "#E30022", width: '16px', height: '16px' }}></FavoriteIcon>
                                :
                                <FavoriteIcon style={{ width: '16px', height: '16px' }}></FavoriteIcon>
                            }
                        </Favorite>
                    </Link>
                    <CardImage src={podcast.thumbnail} />
                </Top>
                <CardInfo>
                    <MainInfo>
                        <Title>{podcast.name}</Title>
                        <Desc>{podcast.desc}</Desc>
                        <AuthorInfo>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Avatar
                                    src={podcast.creator.img} style={{ width: '26px', height: '26px' }}>{podcast.creator.name?.charAt(0).toUpperCase()}</Avatar>
                                <AuthorName>
                                    {podcast.creator.name}
                                </AuthorName>

                            </div>
                            <Views>• {podcast.views} Views</Views>
                        </AuthorInfo>
                    </MainInfo>
                </CardInfo>
            </React.Fragment>
            <PlayIcon>
                {podcast?.type === 'video' ?
                    <PlayArrowTwoTone style={{ width: '28px', height: '28px' }} />
                    :
                    <HeadphonesTwoTone style={{ width: '28px', height: '28px' }} />
                }
            </PlayIcon>
        </Card>
    )
}
