import React, { useEffect, useState, useRef, useCallback } from 'react'
import styled from "styled-components";
import { useTheme } from "styled-components";
import OtpInput from 'react-otp-input';
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch } from 'react-redux';
import { generateOtp, verifyOtp } from '../api/server.js';
import { toast } from 'sonner';


const Title = styled.div`
    font-size: 22px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    margin: 16px 22px;
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


const LoginText = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_secondary};
    margin: 0px 26px 0px 26px;
`;
const Span = styled.span`
    color: ${({ theme }) => theme.primary};
    font-size: 12px;
    margin: 0px 26px 0px 26px;
`;

const Error = styled.div`
    color: red;
    font-size: 12px;
    margin: 2px 26px 8px 26px;
    display: block;
    ${({ error, theme }) =>
            error === "" &&
            `    display: none;
        `}
`;

const Timer = styled.div`
    color: ${({ theme }) => theme.text_secondary};
    font-size: 12px;
    margin: 2px 26px 8px 26px;
    display: block;
`;

const Resend = styled.div`
    color: ${({ theme }) => theme.primary};
    font-size: 14px;
    margin: 2px 26px 8px 26px;
    display: block;
    cursor: pointer;
`;


export const OTP = ({ email, name, otpVerified, setOtpVerified, reason }) => {
    const theme = useTheme();

    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [showTimer, setShowTimer] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState('00:00');

    const Ref = useRef(null);

    const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return { total, hours, minutes, seconds };
    };

    const clearTimer = useCallback((e) => {
        const startTimer = (e) => {
            let { total, minutes, seconds } = getTimeRemaining(e);
            if (total >= 0) {
                setTimer((minutes > 9 ? minutes : '0' + minutes) + ':' + (seconds > 9 ? seconds : '0' + seconds));
            }
        };
    
        setTimer('01:00');
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000);
        Ref.current = id;
    }, []);
    

    const getDeadTime = () => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 60);
        return deadline;
    };

    const sendOtp = useCallback(async () => {
        try {
            const res = await generateOtp(email, name, reason);
            if (res.status === 200 || res.status === 201) {
                toast.success('OTP sent successfully')
                setDisabled(true);
                setOtp('');
                setOtpError('');
                setOtpLoading(false);
                setOtpSent(true);
            } else {
                let errorMessage = '';
                switch (res.status) {
                    case 400:
                        errorMessage = 'Invalid request. Please check your input.';
                        break;
                    case 401:
                        errorMessage = 'Unauthorized. Please sign up and try again.';
                        break;
                    case 404:
                        errorMessage = 'Service not found. Please try again later.';
                        break;
                    default:
                        errorMessage = 'An unexpected error occurred. Please try again.';
                }
                toast.error(errorMessage)
                setOtp('');
                setOtpError(errorMessage);
                setOtpLoading(false);
            }
        } catch (err) {
            toast.error('Failed to send OTP. Please check your network connection and try again.');
            setOtpError('Failed to send OTP. Please check your network connection and try again.');
            setOtpLoading(false);
        }
    }, [email, name, reason]);
    
    const resendOtp = useCallback(() => {
        setShowTimer(true);
        clearTimer(getDeadTime());
        sendOtp();
    }, [clearTimer, sendOtp]);
    
    const validateOtp = () => {
        setOtpLoading(true);
        setDisabled(true);
        verifyOtp(otp).then((res) => {
            if (res.status === 200 || res.status === 201) {
                toast.success('OTP verified successfully');
                setOtpVerified(true);
                setOtp('');
                setOtpError('');
                setDisabled(false);
                setOtpLoading(false);
            } else {
                let errorMessage = '';
                switch (res.status) {
                    case 400:
                        errorMessage = 'Invalid OTP. Please check and try again.';
                        break;
                    case 401:
                        errorMessage = 'Unauthorized. Please sign up and try again.';
                        break;
                    case 404:
                        errorMessage = 'Service not found. Please try again later.';
                        break;
                    default:
                        errorMessage = 'An unexpected error occurred. Please try again.';
                }
                toast.error(errorMessage);
                setOtpError(errorMessage);
                setDisabled(false);
                setOtpLoading(false);
            }
        }).catch((err) => {
            toast.error('Failed to validate OTP. Please check your network connection and try again.');
            setOtpError('Failed to validate OTP. Please check your network connection and try again.');
            setDisabled(false);
            setOtpLoading(false);
        });
    };    

    useEffect(() => {
        sendOtp();
        clearTimer(getDeadTime());
    }, [clearTimer, sendOtp]);

    useEffect(() => {
        if (timer === '00:00') {
            setShowTimer(false);
        } else {
            setShowTimer(true);
        }
    }, [timer]);

    useEffect(() => {
        if (otp.length === 6) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [otp]);

    return (
        <div>
            <Title>VERIFY OTP</Title>
            <LoginText>A verification <b>&nbsp;OTP&nbsp;</b> has been sent to: </LoginText>
            <Span>{email}</Span>
            {!otpSent ? (
                <div style={{ padding: '12px 26px', marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
                    Sending OTP<CircularProgress color="inherit" size={20} />
                </div>
            ) : (
                <div>
                    <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={6}
                        shouldAutoFocus={true}
                        inputStyle={{ fontSize: "22px", width: "38px", height: "38px", borderRadius: "5px", border: "1px solid #ccc", textAlign: "center", margin: "6px 4px", backgroundColor: 'transparent', color: theme.text_primary }}
                        containerStyle={{ padding: '8px 2px', justifyContent: 'center' }}
                        renderInput={(props) => <input {...props} />}
                    />
                    <Error error={otpError}><b>{otpError}</b></Error>
                    <OutlinedBox button={true} activeButton={!disabled} style={{ marginTop: "12px", marginBottom: "12px" }} onClick={() => validateOtp()}>
                        {otpLoading ? <CircularProgress color="inherit" size={20} /> : "Submit"}
                    </OutlinedBox>
                    {showTimer ? <Timer>Resend in <b>{timer}</b></Timer> : <Resend onClick={() => resendOtp()}><b>Resend</b></Resend>}
                </div>
            )}
        </div>
    );
};