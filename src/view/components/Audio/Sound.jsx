import React, { useCallback, useEffect, useRef } from "react";

import { useSelector } from "lib/hooks";
import { useAudio } from "lib/hooks";
import { api } from "lib/index";
import {
	playingTrackDidError,
	playingTrackIsPaused,
	sessionUpdateAudioRef,
	sessionUpdatePlaybackFailure
} from "state/slices/session/sessionActions";

import { createPlaybackFailure, isTransientPlaybackFailure } from "./playbackFailure";

const setMediaSessionPlaybackState = (playbackState) => {
	if (!("mediaSession" in navigator)) return;

	try {
		navigator.mediaSession.playbackState = playbackState;
	} catch (error) {
		console.warn("Unable to update Media Session playback state", error);
	}
};

export function Sound({ track, isPaused, loop, volume, onPlaying, onFinishedPlaying }) {
	const playbackFailure = useSelector((state) => state.session.playing.playbackFailure);
	const trackUrl = api().getUri({ url: `/tracks/${track.id}/audio` });
	// prettier-ignore
	// let trackUrl = "https://cdn.merritt.es/file/collection-2001/03+-+Stay+By+Me.flac";

	const attemptIdRef = useRef(0);
	const attemptPlaybackRef = useRef(null);
	const processFailureRef = useRef(null);
	const retryCountRef = useRef(0);
	const skipNextEffectPlayRef = useRef(false);
	const terminalFailureRecordedRef = useRef(false);
	const trackIdRef = useRef(track.id);
	const isPausedRef = useRef(isPaused);
	const retryingRef = useRef(false);

	const handleEnded = useCallback(() => {
		setMediaSessionPlaybackState("paused");
		onFinishedPlaying();
	}, [onFinishedPlaying]);

	const handleMediaError = useCallback((event) => {
		void processFailureRef.current?.(event.currentTarget, null, {
			requestId: attemptIdRef.current,
			requestTrackId: trackIdRef.current
		});
	}, []);

	const handleMediaPause = useCallback(() => {
		if (!retryingRef.current) setMediaSessionPlaybackState("paused");
	}, []);

	const handleMediaPlaying = useCallback(() => {
		retryCountRef.current = 0;
		terminalFailureRecordedRef.current = false;
		sessionUpdatePlaybackFailure(null);
		playingTrackIsPaused(false);
		setMediaSessionPlaybackState("playing");
	}, []);

	const handleTimeUpdate = useCallback(
		(event) => {
			onPlaying({
				duration: event.currentTarget.duration,
				time: event.currentTarget.currentTime
			});
		},
		[onPlaying]
	);

	const [audio, , , ref] = useAudio({
		src: trackUrl,
		autoPlay: false,
		onEnded: handleEnded,
		onError: handleMediaError,
		onPause: handleMediaPause,
		onPlaying: handleMediaPlaying,
		onTimeUpdate: handleTimeUpdate
	});

	const recordTerminalFailure = useCallback((failure) => {
		if (terminalFailureRecordedRef.current) return;

		terminalFailureRecordedRef.current = true;
		setMediaSessionPlaybackState("none");
		playingTrackDidError(failure);
		console.error(new Error(`Audio playback failed: ${failure.kind}`), failure);
	}, []);

	const processFailure = useCallback(
		async (element, error, context) => {
			const requestId = context?.requestId ?? attemptIdRef.current;
			const requestTrackId = context?.requestTrackId ?? trackIdRef.current;

			if (
				requestId !== attemptIdRef.current ||
				requestTrackId !== trackIdRef.current ||
				isPausedRef.current
			) {
				return false;
			}

			const failure = createPlaybackFailure({
				element,
				error,
				trackId: requestTrackId,
				retryAttempt: retryCountRef.current
			});

			if (failure.kind === "autoplay-blocked") {
				sessionUpdatePlaybackFailure(failure);
				playingTrackIsPaused(true);
				setMediaSessionPlaybackState("paused");
				return false;
			}

			if (isTransientPlaybackFailure(failure) && retryCountRef.current === 0) {
				retryCountRef.current = 1;
				retryingRef.current = true;
				sessionUpdatePlaybackFailure({ ...failure, retryAttempt: 1 });
				element.load();

				return attemptPlaybackRef.current().finally(() => {
					retryingRef.current = false;
				});
			}

			recordTerminalFailure(failure);
			return false;
		},
		[recordTerminalFailure]
	);

	const attemptPlayback = useCallback(
		async ({ userInitiated = false } = {}) => {
			const element = ref.current;
			if (!element) return false;

			const requestTrackId = track.id;
			const requestId = ++attemptIdRef.current;
			const wasPaused = isPausedRef.current;
			isPausedRef.current = false;

			if (userInitiated) {
				skipNextEffectPlayRef.current = wasPaused;
				playingTrackIsPaused(false);
			}

			try {
				await element.play();
				return (
					requestId === attemptIdRef.current &&
					requestTrackId === trackIdRef.current
				);
			} catch (error) {
				return processFailureRef.current?.(element, error, {
					requestId,
					requestTrackId
				});
			}
		},
		[ref, track.id]
	);

	useEffect(() => {
		attemptPlaybackRef.current = attemptPlayback;
		processFailureRef.current = processFailure;
	}, [attemptPlayback, processFailure]);

	useEffect(() => {
		trackIdRef.current = track.id;
		attemptIdRef.current += 1;
		retryCountRef.current = 0;
		terminalFailureRecordedRef.current = false;
		sessionUpdatePlaybackFailure(null);
	}, [track.id]);

	useEffect(() => {
		isPausedRef.current = isPaused;

		if (!isPaused) {
			if (skipNextEffectPlayRef.current) {
				skipNextEffectPlayRef.current = false;
			} else {
				void attemptPlayback();
			}
		} else if (ref.current) {
			attemptIdRef.current += 1;
			ref.current.pause();
			setMediaSessionPlaybackState("paused");
		}
	}, [attemptPlayback, isPaused, ref, trackUrl]);

	useEffect(() => {
		if (ref.current) ref.current.loop = loop;
	}, [loop, ref]);

	useEffect(() => {
		if (ref.current) ref.current.volume = Math.min(1, Math.max(0, volume / 100));
	}, [ref, volume]);

	useEffect(() => {
		sessionUpdateAudioRef(ref);
	}, [ref]);

	useEffect(() => {
		if (!("mediaSession" in navigator)) return undefined;

		const handlePlay = () => {
			void attemptPlayback({ userInitiated: true });
		};
		const handlePause = () => {
			attemptIdRef.current += 1;
			isPausedRef.current = true;
			ref.current?.pause();
			playingTrackIsPaused(true);
			setMediaSessionPlaybackState("paused");
		};

		try {
			navigator.mediaSession.setActionHandler("play", handlePlay);
			navigator.mediaSession.setActionHandler("pause", handlePause);
		} catch (error) {
			console.warn("Unable to register Media Session play/pause handlers", error);
		}

		return () => {
			try {
				navigator.mediaSession.setActionHandler("play", null);
				navigator.mediaSession.setActionHandler("pause", null);
			} catch (error) {
				console.warn("Unable to clear Media Session play/pause handlers", error);
			}
			setMediaSessionPlaybackState("none");
		};
	}, [attemptPlayback, ref]);

	// play: () => Promise<void> | void;
	// pause: () => void;
	// mute: () => void;
	// unmute: () => void;
	// volume: (volume: number) => void;
	// seek: (time: number) => void;

	return (
		<>
			{audio}
			{playbackFailure?.kind === "autoplay-blocked" &&
				playbackFailure.trackId === track.id && (
					<button
						type="button"
						className="audio-resume-prompt"
						onClick={() => {
							void attemptPlayback({ userInitiated: true });
						}}
					>
						Tap to resume audio
					</button>
				)}
		</>
	);
}

export default Sound;
