import React from "react";
import cx from "classnames";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import { useSelector, useDispatch } from "react-redux";

import { api } from "utils";
import { playTrack, queuePush, queueRemove } from "store/actions";

import Image from "../Image";

function TrackBig({
    index,
    size,
    hideIfNonExistent = false,
    className,
    ...props
}) {
    const dispatch = useDispatch();

    // Track and session data from store
    const track = useSelector((state) => state.music.tracks.data[index]);
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const playingIndex = useSelector((state) => state.session.playing.index);
    const playingDidError = useSelector(
        (state) => state.session.playing.didError
    );
    const queuePosition = useSelector((state) =>
        state.music.tracks.queue.indexOf(index)
    );

    // Hide if track doesn't exist
    if (!track && hideIfNonExistent) return null;

    // Is this track currently playing?
    let isTrackPlaying = false;
    if (playingIndex === index) isTrackPlaying = true;
    const isTrackPaused = isTrackPlaying && isPaused;

    const didPlayingTrackError = playingDidError;
    const didError = isTrackPlaying && didPlayingTrackError;

    // Assume loading state
    let trackTitle = <Skeleton />;
    let trackArtist = <Skeleton width="60%" />;
    let trackDuration = <Skeleton />;
    let albumCoverId = "example";

    // Track exists
    if (track) {
        trackTitle = track.metadata.title;
        trackArtist = track.metadata.artist;
        trackDuration = moment
            .utc(track.metadata.duration * 1000)
            .format("mm:ss");
        albumCoverId = track.id;
    }

    // Play track in session
    const playInSession = (e) => {
        dispatch(playTrack(index));
    };

    // Toggle track in queue
    const handleTrackQueue = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (queuePosition === -1) {
            dispatch(queuePush(index));
        } else {
            dispatch(queueRemove(index));
        }
    };

    // Dynamic class list
    const classList = [];
    if (size) classList.push(size);
    if (isTrackPlaying) classList.push("playing");
    if (isTrackPaused) classList.push("paused");
    if (didError) classList.push("error");
    if (className) classList.push(className);

    return (
        <div
            className={cx(`track`, ...classList)}
            onClick={playInSession}
            onContextMenu={handleTrackQueue}
            {...props}
        >
            <div className="track-col image">
                <Image
                    src={api().getUri({
                        url: `/tracks/${albumCoverId}/cover/50`
                    })}
                    fallback={`fallback--album-cover`}
                    alt="album-cover"
                    draggable="false"
                />
            </div>
            <div className="track-col name">
                {trackTitle}
                <div className="artist">{trackArtist}</div>
            </div>
            <div className="track-col length">{trackDuration}</div>
            <div className="track-col queue-state">
                {queuePosition >= 0 && queuePosition + 1}
            </div>
        </div>
    );
}

export default TrackBig;
