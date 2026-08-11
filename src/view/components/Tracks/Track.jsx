import moment from "moment";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTrack } from "catalog";
import { useColor } from "lib/hooks";
import { playTrack, queuePush, queueRemove } from "state/actions";

import { Halo, Icon, Ripple } from "view/components";

export function Track({ track: suppliedTrack, trackId, trackNumber, size, hideIfNonExistent = false }) {
	const dispatch = useDispatch();
	const color = useColor();
	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: queriedTrack } = useTrack(libraryId, trackId);
	const track = suppliedTrack || queriedTrack;
	const isPaused = useSelector((state) => state.session.playing.isPaused);
	const playingId = useSelector((state) => state.session.playing.trackId);
	const playingDidError = useSelector((state) => state.session.playing.didError);
	const queuePosition = useSelector((state) => state.music.queue.indexOf(track?.id));

	if (!track && hideIfNonExistent) return null;
	if (!track) return <div className={`track${size ? ` ${size}` : ""}`} />;

	const isTrackPlaying = track.id === playingId;
	const isTrackPaused = isTrackPlaying && isPaused;
	const didError = isTrackPlaying && playingDidError;

	const handleTrackQueue = (event) => {
		event.preventDefault();
		event.stopPropagation();
		dispatch(queuePosition === -1 ? queuePush(track.id) : queueRemove(track.id));
	};

	const classList = [size, isTrackPlaying && "playing", isTrackPaused && "paused", didError && "error"]
		.filter(Boolean)
		.join(" ");

	return (
		<Ripple style={{ margin: "5px 0" }}>
			<Halo>
				<div
					id={track.id}
					className={`track ${classList}`}
					onClick={() => dispatch(playTrack(track.id))}
					onContextMenu={handleTrackQueue}
				>
					<div className="track-col play-state">
						{isTrackPlaying && !isTrackPaused && !didError ? <Icon name="pause" /> : <Icon name="play" />}
					</div>
					<div className="track-col name">
						{track.title}
						<div className="artist">{track.artist}</div>
					</div>
					<div className="track-col length" style={{ color }}>
						{moment.utc(track.duration * 1000).format("mm:ss")}
					</div>
					<div className="track-col queue-state" style={{ color }}>
						{queuePosition >= 0 && queuePosition + 1}
					</div>
				</div>
			</Halo>
		</Ripple>
	);
}

export default Track;
