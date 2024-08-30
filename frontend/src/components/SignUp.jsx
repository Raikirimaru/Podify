import {
    CloseRounded,
    EmailRounded,
    PasswordRounded,
    Person,
    Visibility,
    VisibilityOff,
    TroubleshootRounded,
} from "@mui/icons-material";
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { IconButton, Modal } from "@mui/material";
import { loginFailure, loginStart, loginSuccess } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import validator from "validator";
import { googleSignIn, signUp } from "../api/server.js";
import { OTP } from "./OTP";
import { useGoogleLogin } from "@react-oauth/google";
import { closeSignin, openSignin } from "../redux/setSigninSlice";
import googleIcon from "../Images/google.svg"
import { toast } from "sonner";
import { useTranslation } from 'react-i18next'


const Container = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #000000a7;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Wrapper = styled.div`
    width: 380px;
    border-radius: 16px;
    background-color: ${({ theme }) => theme.card};
    color: ${({ theme }) => theme.text_secondary};
    padding: 10px;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const Title = styled.div`
    font-size: 22px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    margin: 16px 28px;
`;

const OutlinedBox = styled.div`
    height: 44px;
    border-radius: 12px;
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
    background: ${theme.button};
    color: '${theme.text_secondary}';`}
    ${({ activeButton, theme }) =>
        activeButton &&
        `
    user-select: none; 
    border: none;
    background: ${theme.primary};
    color: white;`}
    margin: 3px 20px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    padding: 0px 14px;
`;

const Divider = styled.div`
    display: flex;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({ theme }) => theme.text_secondary};
    font-size: 14px;
    font-weight: 600;
`;

const Line = styled.div`
    width: 80px;
    height: 1px;
    border-radius: 10px;
    margin: 0px 10px;
    background-color: ${({ theme }) => theme.text_secondary};
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

const LoginText = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_secondary};
    margin: 20px 20px 38px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Span = styled.span`
    color: ${({ theme }) => theme.primary};
`;

const Error = styled.div`
    color: red;
    font-size: 10px;
    margin: 2px 26px 8px 26px;
    display: block;
    ${({ error, theme }) =>
        error === "" &&
        `    display: none;
    `}
`;

export const SignUp = ({ setSignUpOpen, setSignInOpen }) => {

    const [nameValidated, setNameValidated] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [Loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [emailError, setEmailError] = useState("");
    const [credentialError, setcredentialError] = useState("");
    const [passwordCorrect, setPasswordCorrect] = useState(false);
    const [nameCorrect, setNameCorrect] = useState(false);
    const [values, setValues] = useState({
        password: "",
        showPassword: false,
    });

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const { t } = useTranslation()
    const dispatch = useDispatch();

    const createAccount = useCallback(() => {
        if (otpVerified) {
            dispatch(loginStart());
            setDisabled(true);
            setLoading(true);
            try {
                signUp({ name, email, password }).then((res) => {
                    if (res.status === 200) {
                        dispatch(loginSuccess(res.data));
                        toast.success(t('Sign.successCreatedAccount'))
                        setLoading(false);
                        setDisabled(false);
                        setSignUpOpen(false);
                        dispatch(closeSignin());
                    } else {
                        let errorMessage = '';
                        switch (res.status) {
                            case 400:
                                errorMessage = t('otp.invalid_request')
                                break;
                            case 401:
                                errorMessage = t('otp.unauthorized')
                                break;
                            case 404: 
                                errorMessage = t('Sign.userNotFound');
                                break;
                            case 409:
                                errorMessage = t('Sign.userAlreadyExists');
                                break;
                            default:
                                errorMessage = t('otp.unexpected_error')
                        }
                        dispatch(loginFailure());
                        setcredentialError(errorMessage);
                        toast.error(errorMessage)
                        setLoading(false);
                        setDisabled(false);
                    }
                });
            } catch (err) {
                dispatch(loginFailure());
                setLoading(false);
                setDisabled(false);
                console.error(err.message);
                toast.error(t('Sign.createAccountFailed'))
            }
        }
    }, [dispatch, email, name, otpVerified, password, setSignUpOpen, t])
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!disabled) {
            setOtpSent(true);
        }
    
        if (name === "" || email === "" || password === "") {
            toast.error(t('Sign.Errors.emptyFields'))
        }
    };
    
    // Validate email
    const validateEmail = useCallback(() => {
        if (validator.isEmail(email)) {
            setEmailError("");
        } else {
            setEmailError(t('Sign.emailInvalid'));
            toast.error(t('Sign.emailInvalid'))
        }
    }, [email, t])
    
    // Validate password
    const validatePassword = useCallback(() => {
        if (password.length < 8) {
            setPassword(t('Sign.passwordLengthError'));
            toast.error(t('Sign.passwordLengthError'))
            setPasswordCorrect(false);
        } else if (password.length > 16) {
            toast.error(t('Sign.passwordLengthMaxError'))
            setcredentialError(t('Sign.passwordLengthMaxError'));
            setPasswordCorrect(false);
        } else if (
            !password.match(/[a-z]/g) ||
            !password.match(/[A-Z]/g) ||
            !password.match(/[0-9]/g) ||
            !password.match(/[^a-zA-Z\d]/g)
        ) {
            setPasswordCorrect(false);
            setcredentialError(
                t('Sign.passwordComplexityError')
            );
            toast.error( t('Sign.passwordComplexityError'))
        } else {
            setcredentialError("");
            setPasswordCorrect(true);
        }
    }, [password, t])
    
    // Validate name
    const validateName = useCallback(() => {
        if (name.length < 4) {
            setNameValidated(false);
            setNameCorrect(false);
            toast.error(t('Sign.nameTooShort'))
            setcredentialError(t('Sign.nameTooShort'));
        } else {
            setNameCorrect(true);
            if (!nameValidated) {
                toast.error(t('Sign.emailInvalid'))
                setcredentialError("");
                setNameValidated(true);
            }
        }
    }, [name.length, nameValidated, t])
    
    useEffect(() => {
        if (email !== "" || email.trim()) validateEmail();
        if (password !== "" || password.trim()) validatePassword();
        if (name !== "" || name.trim()) validateName();
        if (
            name !== "" &&
            validator.isEmail(email) &&
            passwordCorrect &&
            nameCorrect
        ) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [name, email, passwordCorrect, password, nameCorrect, validateEmail, validatePassword, validateName]);
    
    useEffect(() => {
        createAccount();
    }, [createAccount, otpVerified]);
    
    // Google SignIn
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const user = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                
                const res = await googleSignIn({
                    name: user.data.name,
                    email: user.data.email,
                    img: user.data.picture,
                });
    
                if (res.status === 200) {
                    dispatch(loginSuccess(res.data));
                    dispatch(closeSignin());
                    setSignUpOpen(false);
                    toast.success(t('Sign.successLoggedIn'))
                    setLoading(false);
                } else {
                    let errorMessage = '';
                    switch (res.status) {
                        case 400:
                            errorMessage = t('otp.invalid_request')
                            break;
                        case 401:
                            errorMessage = t('otp.unauthorized')
                            break;
                        default:
                            errorMessage = t('otp.unexpected_error')
                    }
                    dispatch(loginFailure(res.data));
                    toast.error(errorMessage)
                    setLoading(false);
                }
            } catch (err) {
                dispatch(loginFailure());
                toast.error(t('Sign.googleLoginFailed'))
                setLoading(false);
            }
        },
        onError: errorResponse => {
            dispatch(loginFailure());
            toast.error(t('Sign.googleLoginError'))
            console.error(errorResponse.error)
            setLoading(false);
        },
    });
    

    return (
        <Modal open={true} onClose={() => dispatch(closeSignin())}>
            <Container>
                <Wrapper>
                    <CloseRounded
                        style={{
                            position: "absolute",
                            top: "24px",
                            right: "30px",
                            cursor: "pointer",
                            color: "inherit"
                        }}
                        onClick={() => setSignUpOpen(false)}
                    />
                    {!otpSent ?
                        <>
                            <Title>{t('Sign.sign_up_title')}</Title>
                            <OutlinedBox
                                googleButton={TroubleshootRounded}
                                style={{ margin: "24px" }}
                                onClick={() => googleLogin()}
                            >
                                {Loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    <>
                                        <img src={googleIcon} alt="google" width={22} />
                                        {t('Sign.signInWithGoogle')}
                                    </>
                                )}
                            </OutlinedBox>
                            <Divider>
                                <Line />
                                {t('imgSelector.or')}
                                <Line />
                            </Divider>
                            <OutlinedBox style={{ marginTop: "24px" }}>
                                <Person
                                    sx={{ fontSize: "20px" }}
                                    style={{ paddingRight: "12px" }}
                                />
                                <TextInput
                                    placeholder={t('Sign.fullNamePlaceholder')}
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </OutlinedBox>
                            <OutlinedBox>
                                <EmailRounded
                                    sx={{ fontSize: "20px" }}
                                    style={{ paddingRight: "12px" }}
                                />
                                <TextInput
                                    placeholder={t('Sign.emailPlaceholder')}
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </OutlinedBox>
                            <Error error={emailError}>{emailError}</Error>
                            <OutlinedBox>
                                <PasswordRounded
                                    sx={{ fontSize: "20px" }}
                                    style={{ paddingRight: "12px" }}
                                />
                                <TextInput
                                    type={values.showPassword ? "text" : "password"}
                                    placeholder={t('Sign.passwordPlaceholder')}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <IconButton
                                    color="inherit"
                                    onClick={() =>
                                        setValues({ ...values, showPassword: !values.showPassword })
                                    }
                                >
                                    {values.showPassword ? (
                                        <Visibility sx={{ fontSize: "20px" }} />
                                    ) : (
                                        <VisibilityOff sx={{ fontSize: "20px" }} />
                                    )}
                                </IconButton>
                            </OutlinedBox>
                            <Error error={credentialError}>{credentialError}</Error>
                            <OutlinedBox
                                button={true}
                                activeButton={!disabled}
                                style={{ marginTop: "6px" }}
                                onClick={handleSignUp}
                            >
                                {Loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    t('Sign.sign_up')
                                )}
                            </OutlinedBox>
                        </>
                        :
                        <OTP email={email} name={name} otpVerified={otpVerified} setOtpVerified={setOtpVerified} />
                    }
                    <LoginText>
                        {t('Sign.noAccount')}
                        <Span
                            onClick={() => {
                                setSignUpOpen(false);
                                dispatch(openSignin());
                            }}
                            style={{
                                fontWeight: "500",
                                marginLeft: "6px",
                                cursor: "pointer",
                            }}
                        >
                            {t('Sign.login')}
                        </Span>
                    </LoginText>
                </Wrapper>
            </Container>
        </Modal>
    );
};