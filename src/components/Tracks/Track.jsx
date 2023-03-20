import React from "react";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";

import { useColor } from "hooks";
import { playTrack, queuePush, queueRemove } from "store/actions";

import { Icon } from "components/Icon";

function Track({ index, trackNumber, size, hideIfNonExistent = false }) {
    const dispatch = useDispatch();
    const color = useColor();

    // Track and session data from store
    const track = useSelector((state) => state.music.tracks[index]);
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const playingId = useSelector((state) => state.session.playing.track.id);
    const playingDidError = useSelector(
        (state) => state.session.playing.didError
    );
    const queuePosition = useSelector((state) =>
        state.music.queue.indexOf(index)
    );

    // Hide if track doesn't exist
    if (!track && hideIfNonExistent) return null;

    // Is this track currently playing?
    const isTrackPlaying = track.id === playingId;
    const isTrackPaused = isTrackPlaying && isPaused;

    const didPlayingTrackError = playingDidError;
    const didError = isTrackPlaying && didPlayingTrackError;

    // Play this track
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
    let classList = "";
    classList += size ? ` ${size}` : "";
    classList += isTrackPlaying ? " playing" : "";
    classList += isTrackPaused ? " paused" : "";
    classList += didError ? " error" : "";

    return (
        <div
            id={track.id}
            className={`track${classList}`}
            onClick={playInSession}
            onContextMenu={handleTrackQueue}
        >
            <div className="track-col play-state">
                {isTrackPlaying && !isTrackPaused && !didError ? (
                    <Icon name="pause" />
                ) : (
                    <Icon name="play" />
                )}
            </div>
            <div className="track-col name">
                {track.metadata.title}
                <div className="artist">{track.metadata.artist}</div>
            </div>
            <div className="track-col length" style={{ color: color }}>
                {moment.utc(track.metadata.duration * 1000).format("mm:ss")}
            </div>
            <div className="track-col queue-state" style={{ color: color }}>
                {queuePosition >= 0 && queuePosition + 1}
            </div>
        </div>
    );
}

export default Track;
