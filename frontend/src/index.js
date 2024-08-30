import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import { store, persistor } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { I18nextProvider } from "react-i18next";
import i18nx from "./i18n/i18nx";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="884837602756-phd7fn96qbdv89lmihuuqohm0aharmlq.apps.googleusercontent.com">
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <I18nextProvider i18n={i18nx}>
            <App />
          </I18nextProvider>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
