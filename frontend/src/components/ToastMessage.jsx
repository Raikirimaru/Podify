import React from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { closeSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";

export function ToastMessage ({
    message,
    severity,
    open,
})  {
    const dispatch = useDispatch();
    const displayMessage = convertMessageToReactNode(message);

    console.log('message:', displayMessage, 'type:', typeof displayMessage);

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={() => dispatch(closeSnackbar())}
        >
            <Alert
                onClose={() => dispatch(closeSnackbar())}
                severity={severity}
                sx={{ width: "100%" }}
            >
                {displayMessage}
            </Alert>
        </Snackbar>
    );
};

function convertMessageToReactNode(message) {
    if (React.isValidElement(message)) {
        return message;
    } else if (typeof message === 'object') {
        return JSON.stringify(message);
    } else if (typeof message === 'string' || typeof message === 'number') {
        return message;
    }
    return String(message);
}