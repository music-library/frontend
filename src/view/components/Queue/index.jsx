import { css } from "@linaria/core";
import cx from "classnames";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animated, useTrail } from "@react-spring/web";

import { useLibraryTracks } from "catalog";
import { queueNew } from "state/actions";

import { Grid, GridDnd, TrackBig } from "view/components";

export function Queue({ className, ...props }) {
	const dispatch = useDispatch();
	const queue = useSelector((state) => state.music.queue);
	const libraryId = useSelector((state) => state.music.library.selected);
	const tags = useSelector((state) => state.music.filter.tags);
	const playingTrackId = useSelector((state) => state.session.playing.trackId);
	const { data: tracks = [], isLoading } = useLibraryTracks(libraryId, { tags });
	const tracksById = useMemo(() => new Map(tracks.map((track) => [track.id, track])), [tracks]);

	const newQueue = queue.map((trackId) => ({ id: trackId }));

	const setNewQueue = (newNewQueue) => {
		dispatch(queueNew(newNewQueue(newQueue).map((track) => track.id)));
	};

	// Array of the next five track IDs to play after the final queue track
	const nextQueueItems = useMemo(() => {
		const arr = [];
		if (isLoading || tracks.length === 0) return arr;

		const lastQueuedTrackId = [...queue].reverse().find((trackId) => tracksById.has(trackId));
		const anchorId = lastQueuedTrackId || playingTrackId;
		let index = tracks.findIndex((track) => track.id === anchorId);

		if (index < 0) return arr;

		for (let i = 0; i < 5; i++) {
			index = (index + 1) % tracks.length;
			arr.push(tracks[index].id);
		}

		return arr;
	}, [queue, tracks, tracksById, playingTrackId, isLoading]);

	const trail = useTrail(queue?.length + nextQueueItems?.length, {
		from: { opacity: 0, y: 20 },
		to: { opacity: 1, y: 0 },
		reverse: !(!isLoading || !!queue?.length || playingTrackId),
		config: { mass: 2, tension: 4000, friction: 200 }
	});

	return (
		<div className={cx("track-container", className)} {...props}>
			{playingTrackId && (
				<TrackBig size="big" trackId={playingTrackId} className={queueTrack} />
			)}

			<GridDnd
				data={newQueue}
				setData={setNewQueue}
				renderWith={(props) => (
					<TrackBig
						trackId={props?.id}
						className={queueTrack}
						size="big"
						hideIfNonExistent={true}
						{...props}
					/>
				)}
				// grid
				className={gridDndWrapper}
				gutter={5}
				minWidth={"100%"}
				maxWidth={"1fr"}
			/>

			<hr className={separator} />

			{(playingTrackId || !!queue?.length) && (
				<Grid gutter={5} minWidth={"100%"} maxWidth={"1fr"}>
					{trail.slice(queue?.length).map((props, index) => {
						const trackId = nextQueueItems?.[index];
						if (!trackId) return null;

						return (
							<animated.div key={trackId + index} style={props}>
								<TrackBig
									size="big"
									trackId={trackId}
									className={queueTrack}
									hideIfNonExistent={true}
								/>
							</animated.div>
						);
					})}
				</Grid>
			)}
		</div>
	);
}

const separator = css`
	margin: 8rem;
	border: 1px solid #252525;
`;

const gridDndWrapper = css`
	margin: 5px 0;
`;

const queueTrack = css`
	padding: 0 6px !important;
	height: 63px !important;

	.image {
		margin-left: 2px !important;
		margin-right: 13px !important;
	}
`;

export default Queue;
