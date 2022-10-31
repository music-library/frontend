import { useDispatch, useSelector } from "react-redux";
import { css } from "@linaria/core";
import cx from "classnames";

import { queueNew } from "store/actions";

import { Grid, GridDnd } from "components/layout";
import TrackBig from "components/Tracks/TrackBig";

function Queue() {
	const dispatch = useDispatch();
	const queue = useSelector((state) => state.music.tracks.queue);
	const playingIndex = useSelector((state) => state.session.playing.index);

	const newQueue = queue.map((trackId) => ({
		id: String(trackId)
	}));

	const setNewQueue = (newNewQueue) => {
		dispatch(
			queueNew(newNewQueue(newQueue).map((track) => Number(track.id)))
		);
	};

	return (
		<>
			<div className="Queue container">
				<section>
					<h2>Queue</h2>
					<div className={cx("track-container", tracksWrapper)}>
						{playingIndex !== -1 && (
							<TrackBig index={playingIndex} size="big" />
						)}

						<GridDnd
							data={newQueue}
							setData={setNewQueue}
							renderWith={(props) => (
								<TrackBig
									index={Number(props?.id)}
									size="big"
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
								{[...Array(5)].map((e, i) => {
									const index = queue?.length
										? queue?.[queue?.length - 1] + i
										: playingIndex + i;
									return (
										<TrackBig
											hideIfNonExistent={true}
											index={index + 1}
											size="big"
										/>
									);
								})}
							</Grid>
						)}
					</div>
				</section>
			</div>
		</>
	);
}

const tracksWrapper = css`
	margin: 3rem 0;
`;

const separator = css`
	margin: 50px;
	border: 1px solid #252525;
`;

const gridDndWrapper = css`
	margin: 5px 0;
`;

export default Queue;
