import { describe, expect, test } from "vitest";

import { createPlaybackFailure, isTransientPlaybackFailure } from "./playbackFailure";

const makeElement = ({ code = null, networkState = 2, readyState = 0 } = {}) => ({
	error: code == null ? null : { code },
	networkState,
	readyState
});

describe("playback failure classification", () => {
	test.each([
		["NotAllowedError", null, "autoplay-blocked", false],
		["NotSupportedError", null, "unsupported", false],
		["AbortError", null, "aborted", true],
		[null, 1, "aborted", true],
		[null, 2, "network", true],
		[null, 3, "decode", false],
		[null, 4, "unsupported", false]
	])(
		"classifies play error %s and media error %s as %s",
		(errorName, mediaErrorCode, expectedKind, expectedTransient) => {
			const failure = createPlaybackFailure({
				element: makeElement({ code: mediaErrorCode }),
				error: errorName ? { name: errorName } : null,
				trackId: "track-a",
				retryAttempt: 1
			});

			expect(failure).toEqual({
				kind: expectedKind,
				trackId: "track-a",
				playErrorName: errorName,
				mediaErrorCode,
				networkState: 2,
				readyState: 0,
				retryAttempt: 1
			});
			expect(isTransientPlaybackFailure(failure)).toBe(expectedTransient);
		}
	);
});
