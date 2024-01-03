import {
	useEffect,
	useState,
	useRef,
	useCallback,
	isValidElement,
	cloneElement,
	createElement,
} from "react";

function parseTimeRanges(ranges) {
	const result = [];

	for (let i = 0; i < ranges.length; i++) {
		result.push({
			start: ranges.start(i),
			end: ranges.end(i),
		});
	}

	return result;
}

const useSetState = (initialState = {}) => {
	const [state, set] = useState(initialState);

	const setState = useCallback((patch) => {
		set((prevState) =>
			Object.assign(
				{},
				prevState,
				patch instanceof Function ? patch(prevState) : patch
			)
		);
	}, []);

	return [state, setState];
};

function createHTMLMediaHook(tag) {
	return (elOrProps) => {
		let element;
		let props;
		if (isValidElement(elOrProps)) {
			element = elOrProps;
			props = element.props;
		} else {
			props = elOrProps;
		}
		const [state, setState] = useSetState({
			buffered: [],
			time: 0,
			duration: 0,
			paused: true,
			muted: false,
			volume: 1,
			playing: false,
		});
		const ref = useRef(null);
		const wrapEvent = (userEvent, proxyEvent) => {
			return (event) => {
				try {
					proxyEvent && proxyEvent(event);
				} finally {
					userEvent && userEvent(event);
				}
			};
		};
		const onPlay = () => setState({ paused: false });
		const onPlaying = () => setState({ playing: true });
		const onWaiting = () => setState({ playing: false });
		const onPause = () => setState({ paused: true, playing: false });
		const onVolumeChange = () => {
			const el = ref.current;
			if (!el) {
				return;
			}
			setState({
				muted: el.muted,
				volume: el.volume,
			});
		};
		const onDurationChange = () => {
			const el = ref.current;
			if (!el) {
				return;
			}
			const { duration, buffered } = el;
			setState({
				duration,
				buffered: parseTimeRanges(buffered),
			});
		};
		const onTimeUpdate = () => {
			const el = ref.current;
			if (!el) {
				return;
			}
			setState({ time: el.currentTime });
		};
		const onProgress = () => {
			const el = ref.current;
			if (!el) {
				return;
			}
			setState({ buffered: parseTimeRanges(el.buffered) });
		};
		if (element) {
			element = cloneElement(
				element,
				Object.assign(Object.assign({ controls: false }, props), {
					ref,
					onPlay: wrapEvent(props.onPlay, onPlay),
					onPlaying: wrapEvent(props.onPlaying, onPlaying),
					onWaiting: wrapEvent(props.onWaiting, onWaiting),
					onPause: wrapEvent(props.onPause, onPause),
					onVolumeChange: wrapEvent(
						props.onVolumeChange,
						onVolumeChange
					),
					onDurationChange: wrapEvent(
						props.onDurationChange,
						onDurationChange
					),
					onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
					onProgress: wrapEvent(props.onProgress, onProgress),
				})
			);
		} else {
			element = createElement(
				tag,
				Object.assign(Object.assign({ controls: false }, props), {
					ref,
					onPlay: wrapEvent(props.onPlay, onPlay),
					onPlaying: wrapEvent(props.onPlaying, onPlaying),
					onWaiting: wrapEvent(props.onWaiting, onWaiting),
					onPause: wrapEvent(props.onPause, onPause),
					onVolumeChange: wrapEvent(
						props.onVolumeChange,
						onVolumeChange
					),
					onDurationChange: wrapEvent(
						props.onDurationChange,
						onDurationChange
					),
					onTimeUpdate: wrapEvent(props.onTimeUpdate, onTimeUpdate),
					onProgress: wrapEvent(props.onProgress, onProgress),
				})
			); // TODO: fix this typing.
		}
		// Some browsers return `Promise` on `.play()` and may throw errors
		// if one tries to execute another `.play()` or `.pause()` while that
		// promise is resolving. So we prevent that with this lock.
		// See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
		let lockPlay = false;
		const controls = {
			play: () => {
				const el = ref.current;
				if (!el) {
					return undefined;
				}
				if (!lockPlay) {
					const promise = el.play();
					const isPromise = typeof promise === "object";
					if (isPromise) {
						lockPlay = true;
						const resetLock = () => {
							lockPlay = false;
						};
						promise.then(resetLock, resetLock);
					}
					return promise;
				}
				return undefined;
			},
			pause: () => {
				const el = ref.current;
				if (el && !lockPlay) {
					return el.pause();
				}
			},
			seek: (time) => {
				const el = ref.current;
				if (!el || state.duration === undefined) {
					return;
				}
				time = Math.min(state.duration, Math.max(0, time));
				el.currentTime = time;
			},
			volume: (volume) => {
				const el = ref.current;
				if (!el) {
					return;
				}
				volume = Math.min(1, Math.max(0, volume));
				el.volume = volume;
				setState({ volume });
			},
			mute: () => {
				const el = ref.current;
				if (!el) {
					return;
				}
				el.muted = true;
			},
			unmute: () => {
				const el = ref.current;
				if (!el) {
					return;
				}
				el.muted = false;
			},
		};
		useEffect(() => {
			const el = ref.current;
			if (!el) {
				if (import.meta.env.NODE_ENV !== "production") {
					if (tag === "audio") {
						console.error(
							"useAudio() ref to <audio> element is empty at mount. " +
							"It seem you have not rendered the audio element, which it " +
							"returns as the first argument const [audio] = useAudio(...)."
						);
					} else if (tag === "video") {
						console.error(
							"useVideo() ref to <video> element is empty at mount. " +
							"It seem you have not rendered the video element, which it " +
							"returns as the first argument const [video] = useVideo(...)."
						);
					}
				}
				return;
			}
			setState({
				volume: el.volume,
				muted: el.muted,
				paused: el.paused,
			});
			// Start media, if autoPlay requested.
			if (props.autoPlay && el.paused) {
				controls.play();
			}
		}, [props.src]);
		return [element, state, controls, ref];
	};
}

export const useAudio = createHTMLMediaHook("audio");
