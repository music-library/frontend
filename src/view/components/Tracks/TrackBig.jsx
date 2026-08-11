import cx from "classnames";
import moment from "moment";
import React from "react";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";

import { useTrack } from "catalog";
import { api } from "lib/index";
import { playTrack, queuePush, queueRemove } from "state/actions";

import { Halo, Image } from "view/components";

export function TrackBig({ track: suppliedTrack, trackId, size, hideIfNonExistent = false, className, ...props }) {
	const dispatch = useDispatch();
	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: queriedTrack } = useTrack(libraryId, trackId);
	const track = suppliedTrack || queriedTrack;
	const isPaused = useSelector((state) => state.session.playing.isPaused);
	const playingId = useSelector((state) => state.session.playing.trackId);
	const playingDidError = useSelector((state) => state.session.playing.didError);
	const queuePosition = useSelector((state) => state.music.queue.indexOf(track?.id));

	if (!track && hideIfNonExistent) return null;
	const isTrackPlaying = track?.id === playingId;
	const isTrackPaused = isTrackPlaying && isPaused;
	const didError = isTrackPlaying && playingDidError;

	const handleTrackQueue = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!track) return;
		dispatch(queuePosition === -1 ? queuePush(track.id) : queueRemove(track.id));
	};

	return (
		<Halo>
			<div
				className={cx("track", size, className, {
					playing: isTrackPlaying,
					paused: isTrackPaused,
					error: didError
				})}
				onClick={() => track && dispatch(playTrack(track.id))}
				onContextMenu={handleTrackQueue}
				{...props}
			>
				<div className="track-col image">
					<Image
						src={api().getUri({ url: `/tracks/${track?.id || "example"}/cover/50` })}
						fallback="fallback--album-cover"
						alt="album-cover"
						draggable="false"
					/>
				</div>
				<div className="track-col name">
					{track?.title || <Skeleton />}
					<div className="artist">{track?.artist || <Skeleton width="60%" />}</div>
				</div>
				<div className="track-col length">
					{track ? moment.utc(track.duration * 1000).format("mm:ss") : <Skeleton />}
				</div>
				<div className="track-col queue-state">{queuePosition >= 0 && queuePosition + 1}</div>
			</div>
		</Halo>
	);
}

export default TrackBig;
