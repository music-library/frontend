import { css } from "@linaria/core";
import { animated, useTrail } from "@react-spring/web";
import cx from "classnames";
import { useMemo } from "react";

import { useSelector } from "lib/hooks";
import { getNextTrack } from "lib/index";
import { queueNew } from "state/actions";

import { Grid, GridDnd, TrackBig } from "view/components";

export function Queue({ className, ...props }) {
	const queue = useSelector((state) => state.music.queue);
	const tracksMap = useSelector((state) => state.music.tracksMap);
	const isFetching = useSelector((state) => state.music.isFetching);
	const playingIndex = useSelector((state) => state.session.playing.index);

	const newQueue = queue.map((trackId) => ({ id: trackId }));

	const setNewQueue = (newNewQueue) => {
		queueNew(newNewQueue(newQueue).map((track) => track.id));
	};

	// Array of the next five track indexes to play after the final queue track
	const nextQueueItems = useMemo(() => {
		const arr = [];
		if (isFetching) return arr;

		const lastQueuedTrackId = [...queue]
			.reverse()
			.find((trackId) => Object.prototype.hasOwnProperty.call(tracksMap, trackId));
		let index =
			lastQueuedTrackId == null ? playingIndex : tracksMap[lastQueuedTrackId];

		if (index == null || index < 0) return arr;

		for (let i = 0; i < 5; i++) {
			index = getNextTrack(index);
			arr.push(index);
		}

		return arr;
	}, [queue, tracksMap, playingIndex, isFetching]);

	const trail = useTrail(queue?.length + nextQueueItems?.length, {
		from: { opacity: 0, y: 20 },
		to: { opacity: 1, y: 0 },
		reverse: !(playingIndex !== -1 || !!queue?.length || !isFetching),
		config: { mass: 2, tension: 4000, friction: 200 }
	});

	return (
		<div className={cx("track-container", className)} {...props}>
			{playingIndex !== -1 && (
				<TrackBig size="big" index={playingIndex} className={queueTrack} />
			)}

			<GridDnd
				data={newQueue}
				setData={setNewQueue}
				renderWith={(props) => (
					<TrackBig
						index={tracksMap?.[props?.id]}
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

			{(playingIndex !== -1 || !!queue?.length) && (
				<Grid gutter={5} minWidth={"100%"} maxWidth={"1fr"}>
					{trail.slice(queue?.length).map((props, index) => {
						const trackIndex = nextQueueItems?.[index];
						if (trackIndex == null) return null;

						return (
							<animated.div key={trackIndex + index} style={props}>
								<TrackBig
									size="big"
									index={trackIndex}
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
