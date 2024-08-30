import React from 'react';
import styled from 'styled-components';
import { LoginTwoTone, MenuOutlined } from '@mui/icons-material';
import { IconButton, Avatar } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { openSignin } from '../redux/setSigninSlice';
import { Link } from 'react-router-dom';
import { NotificationIcon } from './NotificationIcon';
import { useTranslation } from 'react-i18next';

const Navbardiv = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 16px 40px;
    align-items: center;
    box-sizing: border-box;
    color: ${({ theme }) => theme.text_primary};
    gap: 30px;
    background: ${({ theme }) => theme.bg};
    border-radius: 5px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5.7px);
    -webkit-backdrop-filter: blur(5.7px);
    @media (max-width: 768px) {
        padding: 16px;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 50px;
`;

const Buttondiv = styled.div`
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
    &:hover {
        background-color: ${({ theme }) => theme.primary};
        color: ${({ theme }) => theme.text_primary};
    }
`;

const IcoButton = styled(IconButton)`
    color: ${({ theme }) => theme.text_secondary} !important;
`;

const Welcome = styled.div`
    font-size: 26px;
    font-weight: 600;
    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const LanguageSelector = styled.select`
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text_primary};
    font-size: 16px;
    cursor: pointer;
    &:focus {
        outline: none;
    }
`;

export function NavBar({ setMenuOpen, menuOpen, setSignInOpen, setSignUpOpen }) {
    const { currentUser } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <Navbardiv>
            <IcoButton onClick={() => setMenuOpen(!menuOpen)}>
                <MenuOutlined />
            </IcoButton>
            {currentUser ? (
                <Welcome>
                    {t('welcome')}, {currentUser?.name}
                </Welcome>
            ) : (
                <>&nbsp;</>
            )}
            <ButtonContainer>
                <NotificationIcon />
                <LanguageSelector onChange={changeLanguage} value={i18n.language}>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                </LanguageSelector>
                {currentUser ? (
                    <Link to='/profile' style={{ textDecoration: 'none' }}>
                        <Avatar src={currentUser?.img}>
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                    </Link>
                ) : (
                    <Buttondiv onClick={() => dispatch(openSignin())}>
                        <LoginTwoTone style={{ fontSize: "18px" }} />
                        {t('login')}
                    </Buttondiv>
                )}
            </ButtonContainer>
        </Navbardiv>
    );
}