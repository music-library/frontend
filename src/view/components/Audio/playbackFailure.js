const MEDIA_ERROR_ABORTED = 1;
const MEDIA_ERROR_NETWORK = 2;
const MEDIA_ERROR_DECODE = 3;
const MEDIA_ERROR_SRC_NOT_SUPPORTED = 4;

export const createPlaybackFailure = ({
	element,
	error = null,
	trackId,
	retryAttempt = 0
}) => {
	const mediaErrorCode = element?.error?.code ?? null;
	const playErrorName = error?.name ?? null;
	let kind = "unknown";

	if (playErrorName === "NotAllowedError") {
		kind = "autoplay-blocked";
	} else if (
		playErrorName === "NotSupportedError" ||
		mediaErrorCode === MEDIA_ERROR_SRC_NOT_SUPPORTED
	) {
		kind = "unsupported";
	} else if (mediaErrorCode === MEDIA_ERROR_NETWORK) {
		kind = "network";
	} else if (playErrorName === "AbortError" || mediaErrorCode === MEDIA_ERROR_ABORTED) {
		kind = "aborted";
	} else if (mediaErrorCode === MEDIA_ERROR_DECODE) {
		kind = "decode";
	}

	return {
		kind,
		trackId,
		playErrorName,
		mediaErrorCode,
		networkState: element?.networkState ?? null,
		readyState: element?.readyState ?? null,
		retryAttempt
	};
};

export const isTransientPlaybackFailure = (failure) =>
	failure.kind === "network" || failure.kind === "aborted";
