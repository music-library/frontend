export const appName = "Music Library"; // Optionally use `import.meta.env.REACT_APP_NAME`
export const appVersion = import.meta.env.REACT_APP_VERSION;
export const gitBranch = import.meta.env.REACT_APP_GIT_BRANCH;
export const gitCommitHash = import.meta.env.REACT_APP_GIT_COMMIT;
export const environment = import.meta.env.MODE;

/**
 * Returns version string including app name, version, git branch, and commit hash.
 *
 * E.g `App [Version 1.0.0 (development 4122b6...dc7c)]`
 */
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

        // Branch name (hide in production)
        if (gitBranch !== "master" && environment !== "production") {
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
