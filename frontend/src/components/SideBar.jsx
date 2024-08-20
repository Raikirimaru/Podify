import React from 'react';
import styled from 'styled-components';
import logo from '../Images/logo.svg';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { openSignin } from '../redux/setSigninSlice';
import { logout } from "../redux/userSlice";
import { BackupTwoTone, CloseTwoTone, DarkModeTwoTone, LightModeTwoTone, FavoriteTwoTone, SearchTwoTone, LoginTwoTone, LogoutTwoTone, PodcastsTwoTone } from '@mui/icons-material';

const MenuContainer = styled.div`
    flex: 0.5;
    padding: 0 16px;
    flex-direction: column;
    height: 100vh;
    display: flex;
    box-sizing: border-box;
    align-items: flex-start;
    background-color: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.text_primary};
    @media (max-width: 1100px) {
        position: fixed;
        z-index: 1000;
        width: 100%;
        max-width: 250px;
        left: ${({ menuOpen }) => (menuOpen ? '0' : '-100%')};
        transition: 0.3s ease-in-out;
    }
`;

const Logo = styled.div`
    color: ${({ theme }) => theme.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: bold;
    font-size: 24px;
    margin: 16px 0;
`;

const Close = styled.div`
    display: none;
    @media (max-width: 1100px) {
        display: block;
    }
`;

const Elements = styled.div`
    padding: 10px 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    width: 100%;
    color: ${({ theme }) => theme.text_secondary};
    transition: background-color 0.3s, box-shadow 0.3s;
    &:hover {
        background-color: ${({ theme }) => theme.text_secondary + '50'};
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
    &:focus {
        outline: 2px solid ${({ theme }) => theme.primary};
        outline-offset: 2px;
    }
`;

const NavText = styled.div`
    padding: 12px 0;
    text-decoration: none;
`;

const Flex = styled.div`
    justify-content: space-between;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;
`;

const Image = styled.img`
    height: 40px;
`;

const HR = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.text_secondary + '50'};
    margin: 10px 0;
`;

export const SideBar = ({ menuOpen, setMenuOpen, setDarkmode, darkmode, setUploadOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const logoutUser = () => {
        dispatch(logout());
        navigate(`/`);
    };

    return (
        <MenuContainer setMenuOpen={setMenuOpen}>
            <Flex>
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                    <Logo>
                        <Image src={logo} />
                        Podify
                    </Logo>
                </Link>
                <Close>
                    <CloseTwoTone onClick={() => setMenuOpen(false)} style={{ cursor: "pointer" }} />
                </Close>
            </Flex>
            <Link to='/' style={{ textDecoration: "none", color: "inherit", width: '100%' }}>
                <Elements>
                    <PodcastsTwoTone />
                    <NavText>Dashboard</NavText>
                </Elements>
            </Link>
            <Link to='/search' style={{ textDecoration: "none", color: "inherit", width: '100%' }}>
                <Elements>
                    <SearchTwoTone />
                    <NavText>Search</NavText>
                </Elements>
            </Link>
            {
                currentUser ? (
                    <Link to='/favorites' style={{ textDecoration: "none", color: "inherit", width: '100%' }}>
                        <Elements>
                            <FavoriteTwoTone />
                            <NavText>Favorites</NavText>
                        </Elements>
                    </Link >
                ) : (
                    <Link onClick={() =>
                        dispatch(
                            openSignin()
                        )
                    } style={{ textDecoration: "none", color: "inherit", width: '100%' }}>
                        <Elements>
                            <FavoriteTwoTone />
                            <NavText>Favorites</NavText>
                        </Elements>
                    </Link >
                )
            }
            <HR />
            <Link onClick={() => {
                if (currentUser) {
                    setUploadOpen(true)
                } else {
                    dispatch(
                        openSignin()
                    )
                }
            }} style={{ textDecoration: "none", color: "inherit", width: '100%' }}>
                <Elements>
                    <BackupTwoTone />
                    <NavText>Upload</NavText>
                </Elements>
            </Link>


            {
                darkmode ?
                    <>
                        <Elements onClick={() => setDarkmode(false)}>
                            <LightModeTwoTone />
                            <NavText>Light Mode</NavText>
                        </Elements>
                    </>
                    :
                    <>
                        <Elements onClick={() => setDarkmode(true)}>
                            <DarkModeTwoTone />
                            <NavText>Dark Mode</NavText>
                        </Elements>
                    </>
            }
            {
                currentUser ?
                    <Elements onClick={() => logoutUser()}>
                        <LogoutTwoTone />
                        <NavText>Log Out</NavText>
                    </Elements>

                    :
                    <Elements onClick={() => dispatch(openSignin())}>
                        <LoginTwoTone />
                        <NavText>Log In</NavText>
                    </Elements>
            }

        </MenuContainer >
    )
};
