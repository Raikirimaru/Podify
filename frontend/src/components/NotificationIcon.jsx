import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import NotificationsIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import { IconButton, Badge, Menu, MenuItem, ListItemText } from '@mui/material';
import io from 'socket.io-client'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import { useTranslation } from "react-i18next"

const NotificationIconContainer = styled.div`
    position: relative;
`;

const NotificationText = styled.div`
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const NotificationIcon = () => {
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const WebSocketPath = process.env.REACT_APP_NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : 'http://localhost:4040'


    useEffect(() => {
        if (currentUser) {
            const socket = io(`${WebSocketPath}`, {
                withCredentials: true,
                query: { userId: currentUser?._id }
            })

            socket.emit('join', currentUser?._id)

            socket.on('new_episode', (notification) => {
                setNotifications((prevNotifications) => [notification, ...prevNotifications])
                toast.info(t('notification.new_notification'));
            })

            return () => {
                socket.disconnect()
            }
        }
    }, [WebSocketPath, currentUser, t]);

    

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function handleNotificationClick(id) {
        navigate(`/podcast/${id}`);
        handleClose();
    }

    return (
        <NotificationIconContainer>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={notifications.length} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: '400px',
                        width: '300px',
                    },
                }}
            >
                {notifications.length === 0 ? (
                    <MenuItem onClick={handleClose}>
                        <ListItemText primary={t('notification.no_notifications')} />
                    </MenuItem>
                ) : (
                    notifications.map((notification, index) => (
                        <MenuItem key={index} onClick={() => handleNotificationClick(notification.episodeId)}>
                            <ListItemText primary={<NotificationText>{notification.message}</NotificationText>} secondary={new Date(notification.date).toLocaleString()} />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </NotificationIconContainer>
    );
};