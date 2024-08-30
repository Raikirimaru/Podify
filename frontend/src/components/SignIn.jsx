import {
    CloseRounded,
    EmailRounded,
    Visibility,
    VisibilityOff,
    PasswordRounded,
    TroubleshootRounded,
} from "@mui/icons-material";
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { IconButton, Modal } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { loginFailure, loginStart, loginSuccess } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import validator from "validator";
import { signIn, googleSignIn, findUserByEmail, resetPassword } from "../api/server.js";
import { OTP } from "./OTP";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import googleIcon from "../Images/google.svg";
import { closeSignin } from "../redux/setSigninSlice";
import { toast } from 'sonner'
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
    color:'${theme.bg}';`}
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

const GoogleIcon = styled.img`
    width: 22px;
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
    margin: 20px 20px 30px 20px;
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
`

const ForgetPassword = styled.div`
    color: ${({ theme }) => theme.text_secondary};
    font-size: 13px;
    margin: 8px 26px;
    display: block;
    cursor: pointer;
    text-align: right;
    &:hover {
        color: ${({ theme }) => theme.primary};
    }
`;

export const SignIn = ({ setSignInOpen, setSignUpOpen }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [values, setValues] = useState({
        password: "",
        showPassword: false,
    });
    const [showOTP, setShowOTP] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [samePassword, setSamePassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [passwordCorrect, setPasswordCorrect] = useState(false);
    const [resetDisabled, setResetDisabled] = useState(true);
    const [resettingPassword, setResettingPassword] = useState(false);
    const dispatch = useDispatch();
    const { t } = useTranslation()

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!disabled) {
            dispatch(loginStart());
            setDisabled(true);
            setLoading(true);
            
            if (email === "" || password === "") {
                setLoading(false);
                setDisabled(false);
                toast.error(t('Sign.Errors.emptyFields'))
                return;
            }
            
            try {
                const res = await signIn({ email, password });
                if (res.status === 200 || res.status === 201) {
                    dispatch(loginSuccess(res.data));
                    setLoading(false);
                    setDisabled(false);
                    dispatch(closeSignin());
                    toast.success(t('Sign.successLoggedIn'))
                } else if (res.status === 203) {
                    dispatch(loginFailure());
                    setLoading(false);
                    setDisabled(false);
                    setCredentialError(t('Sign.accountNotVerified'));
                    toast.error(t('Sign.Errors.accountNotVerified'))
                } else if (res.status === 400) {
                    dispatch(loginFailure());
                    setLoading(false);
                    setDisabled(false);
                    setCredentialError(t('Sign.invalidCredentials'));
                    toast.error(t('Sign.Errors.invalidEmailOrPassword'))
                } else if (res.status === 401) {
                    dispatch(loginFailure());
                    setLoading(false);
                    setDisabled(false);
                    setCredentialError(t('Sign.incorrectPassword'));
                    toast.error(t('Sign.Errors.incorrectPassword'))
                } else if (res.status === 500) {
                    dispatch(loginFailure());
                    setLoading(false);
                    setDisabled(false);
                    toast.error(t('Sign.Errors.internalServerError'))
                } else {
                    dispatch(loginFailure());
                    setLoading(false);
                    setDisabled(false);
                    console.error(res.data.message)
                    setCredentialError(t('Sign.Errors.unexpected'));
                    toast.error(t('Sign.Errors.loginFailed'))
                }
            } catch (err) {
                dispatch(loginFailure());
                setLoading(false);
                setDisabled(false);
                if (err.response && err.response.status === 401) {
                    setCredentialError(t('Sign.incorrectPassword'));
                    toast.error(t('Sign.Errors.incorrectPassword'))
                } else if (err.message.includes('Network Error')) {
                    toast.error(t('Sign.Errors.connectionError'))
                } else {
                    console.error(err.message);
                    toast.error(t('Sign.Errors.loginFailed'))
                }
            }
        }
    };    
    
    const [emailError, setEmailError] = useState("");
    const [credentialError, setCredentialError] = useState("");
    
    const validateEmail = useCallback(() => {
        if (validator.isEmail(email)) {
            setEmailError("");
        } else {
            setEmailError(t('Sign.emailInvalid'));
            toast.error(t('Sign.emailInvalid'))
        }
    }, [email, t]);
    
    const validatePassword = useCallback(() => {
        if (newPassword.length < 8) {
            setSamePassword(t('Sign.passwordLengthError'));
            toast.error(t('Sign.passwordLengthError'))
            setPasswordCorrect(false);
        } else if (newPassword.length > 16) {
            setSamePassword(t('Sign.passwordLengthMaxError'));
            toast.error(t('Sign.passwordLengthMaxError'))
            setPasswordCorrect(false);
        } else if (
            !newPassword.match(/[a-z]/g) ||
            !newPassword.match(/[A-Z]/g) ||
            !newPassword.match(/[0-9]/g) ||
            !newPassword.match(/[^a-zA-Z\d]/g)
        ) {
            setPasswordCorrect(false);
            setSamePassword(
                t('Sign.passwordComplexityError')
            );
            toast.error(t('Sign.passwordComplexityError'))
        } else {
            setSamePassword("");
            setPasswordCorrect(true);
        }
    }, [newPassword, t]);
    
    useEffect(() => {
        if (email !== "") validateEmail();
        if (validator.isEmail(email) && password.length > 5) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [email, password, validateEmail]);
    
    useEffect(() => {
        if (newPassword !== "") validatePassword();
        if (passwordCorrect && newPassword === confirmedPassword) {
            setSamePassword("");
            setResetDisabled(false);
        } else if (confirmedPassword !== "" && passwordCorrect) {
            setSamePassword(t('Sign.passwordMismatchError'));
            toast.error(t('Sign.passwordMismatchError'));
            setResetDisabled(true);
        }
    }, [newPassword, confirmedPassword, validatePassword, passwordCorrect, dispatch, t]);
    
    const sendOtp = async () => {
        if (!resetDisabled) {
            setResetDisabled(true);
            setLoading(true);
            try {
                const res = await findUserByEmail(email);
                if (res.status === 200 || res.status === 201) {
                    setShowOTP(true);
                    setResetDisabled(false);
                    setLoading(false);
                } else if (res.status === 202) {
                    setEmailError(t('Sign.userNotFound'));
                    toast.error(t('Sign.userNotFound'))
                    setResetDisabled(false);
                    setLoading(false);
                } else {
                    setEmailError(t('otp.failed_send_otp'));
                    setResetDisabled(false);
                    setLoading(false);
                }
            } catch (err) {
                setResetDisabled(false);
                setLoading(false);
                console.error(err);
                toast.error(t('Sign.otpSendFailure'))
            }
        }
    };
    
    const performResetPassword = useCallback(async () => {
        if (otpVerified) {
            setShowOTP(false);
            setResettingPassword(true);
            try {
                const res = await resetPassword(email, confirmedPassword);
                if (res.status === 200) {
                    toast.success(t('Sign.passwordResetSuccess'))
                    setShowForgotPassword(false);
                    setEmail("");
                    setNewPassword("");
                    setConfirmedPassword("");
                    setOtpVerified(false);
                    setResettingPassword(false);
                } else {
                    toast.error(t('Sign.passwordResetFailed'))
                    console.error(res.data.message);
                    setShowOTP(false);
                    setOtpVerified(false);
                    setResettingPassword(false);
                }
            } catch (err) {
                toast.error(t('Sign.passwordResetFailed'))
                setShowOTP(false);
                setOtpVerified(false);
                setResettingPassword(false);
            }
        }
    }, [otpVerified, email, confirmedPassword, t]);
    
    const closeForgetPassword = () => {
        setShowForgotPassword(false);
        setShowOTP(false);
    };
    
    useEffect(() => {
        performResetPassword();
    }, [otpVerified, performResetPassword]);
    
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
                    toast.success(t('Sign.successLoggedIn'));
                    setLoading(false);
                } else {
                    dispatch(loginFailure(res.data));
                    console.warn(res.data.message)
                    toast.warning(t('Sign.googleLoginFailed'))
                    setLoading(false);
                }
            } catch (err) {
                dispatch(loginFailure());
                console.error(err.message)
                toast.error(t('Sign.googleLoginFailed'))
                setLoading(false);
            }
        },
        onError: (errorResponse) => {
            dispatch(loginFailure());
            setLoading(false);
            toast.error(t('Sign.googleLoginError'))
            console.error(errorResponse);
        },
    });    

    return (
        <Modal open={true} onClose={() => dispatch(closeSignin())}>
            <Container>
                {!showForgotPassword ? (
                    <Wrapper>
                        <CloseRounded
                            style={{
                                position: "absolute",
                                top: "24px",
                                right: "30px",
                                cursor: "pointer",
                            }}
                            onClick={() => dispatch(closeSignin())}
                        />
                        <>
                            <Title>{t('Sign.title')}</Title>
                            <OutlinedBox
                                googleButton={TroubleshootRounded}
                                style={{ margin: "24px" }}
                                onClick={() => googleLogin()}
                            >
                                {loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    <>
                                        <GoogleIcon src={googleIcon} />
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
                                    placeholder={t('Sign.passwordPlaceholder')}
                                    type={values.showPassword ? "text" : "password"}
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
                            <ForgetPassword onClick={() => setShowForgotPassword(true)}>
                                <b>{t('Sign.forgotPassword')}</b>
                            </ForgetPassword>
                            <OutlinedBox
                                button={true}
                                activeButton={!disabled}
                                style={{ marginTop: "6px" }}
                                onClick={handleLogin}
                            >
                                {loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    t('Sign.login')
                                )}
                            </OutlinedBox>
                        </>
                        <LoginText>
                            {t('Sign.noAccount')}
                            <Span
                                onClick={() => {
                                    setSignUpOpen(true);
                                    dispatch(closeSignin());
                                }}
                                style={{
                                    fontWeight: "500",
                                    marginLeft: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                {t('Sign.createAccount')}
                            </Span>
                        </LoginText>
                    </Wrapper>
                ) : (
                    <Wrapper>
                        <CloseRounded
                            style={{
                                position: "absolute",
                                top: "24px",
                                right: "30px",
                                cursor: "pointer",
                            }}
                            onClick={closeForgetPassword}
                        />
                        {!showOTP ? (
                            <>
                                <Title>{t('Sign.resetPasswordTitle')}</Title>
                                {resettingPassword ? (
                                    <div
                                        style={{
                                            padding: '12px 26px',
                                            marginBottom: '20px',
                                            textAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '14px',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {t('Sign.updatingPassword')}
                                        <CircularProgress color="inherit" size={20} />
                                    </div>
                                ) : (
                                    <>
                                        <OutlinedBox style={{ marginTop: "24px" }}>
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
                                                placeholder={t('Sign.newPasswordPlaceholder')}
                                                type="text"
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </OutlinedBox>
                                        <OutlinedBox>
                                            <PasswordRounded
                                                sx={{ fontSize: "20px" }}
                                                style={{ paddingRight: "12px" }}
                                            />
                                            <TextInput
                                                placeholder={t('Sign.confirmPasswordPlaceholder')}
                                                type={values.showPassword ? "text" : "password"}
                                                onChange={(e) => setConfirmedPassword(e.target.value)}
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
                                        <Error error={samePassword}>{samePassword}</Error>
                                        <OutlinedBox
                                            button={true}
                                            activeButton={!resetDisabled}
                                            style={{ marginTop: "6px", marginBottom: "24px" }}
                                            onClick={sendOtp}
                                        >
                                            {loading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : (
                                                t('Sign.submitButton')
                                            )}
                                        </OutlinedBox>
                                        <LoginText>
                                            {t('Sign.noAccount')}
                                            <Span
                                                onClick={() => {
                                                    setSignUpOpen(true);
                                                    dispatch(closeSignin());
                                                }}
                                                style={{
                                                    fontWeight: "500",
                                                    marginLeft: "6px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {t('Sign.createAccount')}
                                            </Span>
                                        </LoginText>
                                    </>
                                )}
                            </>
                        ) : (
                            <OTP email={email} name="User" otpVerified={otpVerified} setOtpVerified={setOtpVerified} reason="FORGOTPASSWORD" />
                        )}
                    </Wrapper>
                )}
            </Container>
        </Modal>
    );
};