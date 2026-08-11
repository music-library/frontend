import { init as bugcatchInit } from "@bug-catch/browser";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { api } from "lib/index";
import "lib/styles/index.scss";
import "react-loading-skeleton/dist/skeleton.css";

import { HaloProvider } from "view/components";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import App from "./App";

// Bugcatch init
// logs all errors
if (feature("bugcatch")) {
	bugcatchInit({
		baseUrl: api().getUri({ url: `/bugcatch` }),
		release: env.appVersion
	});
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement as HTMLElement);

root.render(
	<StrictMode>
		<Router>
			<HaloProvider>
				<App />
			</HaloProvider>
		</Router>
	</StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// @ts-ignore: config param is optional
serviceWorkerRegistration.register();
