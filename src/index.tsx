import { StrictMode } from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { init as bugcatchInit } from "@bug-catch/browser";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";

import store from "store";
import "styles/index.scss";
import { injectGlobalLog, versionLog, appVersion, api } from "utils";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

injectGlobalLog();
versionLog();

// Bugcatch init
// logs all errors
if (import.meta.env.REACT_APP_BUGCATCH_ENABLE) {
    bugcatchInit({
        base_url: api().getUri({ url: `/bugcatch` }),
        release: appVersion
    });
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement as HTMLElement);

root.render(
    <StrictMode>
        <Provider store={store}>
            <Router>
                <App />
            </Router>
        </Provider>
    </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// @ts-ignore: config param is optional
serviceWorkerRegistration.register();
