import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { api } from "utils";
import { useAudio } from "hooks/useAudio";
import { useDebouncedCallback } from "hooks/useDebounce";
import { sessionUpdateAudioRef } from "store/actions";

function Sound({
    track,
    isPaused,
    loop,
    volume,
    onPlaying,
    onFinishedPlaying,
    onError
}) {
    const dispatch = useDispatch();
    const trackUrl = api().getUri({ url: `/tracks/${track.id}/audio` });
    // prettier-ignore
    // let trackUrl = "https://cdn.merritt.es/file/collection-2001/03+-+Stay+By+Me.flac";

    const [audio, state, controls, ref] = useAudio({
        src: trackUrl,
        autoPlay: false,
    });

    // Debounce callback (limits how often it is called, improves performance)
    const debounceState = useDebouncedCallback(
        () => onPlaying(state), // onPlaying(state)
        100,
        { maxWait: 100 }
    );

    useEffect(() => {
        if (!isPaused) {
            controls.play();
        } else {
            controls.pause();
        }
    }, [trackUrl, isPaused]);

    useEffect(() => {
        ref.current.loop = loop;
    }, [loop]);

    useEffect(() => {
        controls.volume(volume / 100);
    }, [volume]);

    useEffect(() => {
        debounceState();
    }, [state]);

    useEffect(() => {
        if (ref && ref.current) {
            dispatch(sessionUpdateAudioRef(ref));
            ref.current.addEventListener("ended", onFinishedPlaying, false);
            ref.current.addEventListener("error", onError, false);

            return function cleanup() {
                if (!ref || !ref.current) return;
                // prettier-ignore
                ref.current.removeEventListener("ended", onFinishedPlaying, false);
                ref.current.removeEventListener("error", onError, false);
            };
        }
    }, []);

    // play: () => Promise<void> | void;
    // pause: () => void;
    // mute: () => void;
    // unmute: () => void;
    // volume: (volume: number) => void;
    // seek: (time: number) => void;

    return <>{audio}</>;
}

export default Sound;
