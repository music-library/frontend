export const appName = "Music Library"; // Optionally use `import.meta.env.REACT_APP_NAME`
export const appVersion = import.meta.env.REACT_APP_VERSION;
export const gitBranch = import.meta.env.REACT_APP_GIT_BRANCH;
export const gitCommitHash = import.meta.env.REACT_APP_GIT_COMMIT;
export const environment = import.meta.env.MODE;

export const versionString = () => {
	if (!appVersion) {
		return `${appName} [Version unknown]`;
	}

	let versionString = `${appName} [Version ${appVersion}`;

	if (gitCommitHash) {
		versionString += ` (`;

		// ENV
		if (environment !== "production") {
			versionString += `${environment ?? "unknown"} `;
		}

		// Branch name
		if (gitBranch !== "master") {
			versionString += `${gitBranch ?? "unknown"}/`;
		}

		// Commit hash
		versionString += `${gitCommitHash})`;
	}

	versionString += `]`;

	return versionString;
};

export const versionLog = () => {
	log(versionString());
};
