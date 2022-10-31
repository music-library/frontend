import { useDispatch, useSelector } from "react-redux";
import { css } from "@linaria/core";
import cx from "classnames";

import { queueNew } from "store/actions";

import { GridDnd } from "components/layout";
import TrackBig from "components/Tracks/TrackBig";

function Queue() {
	const dispatch = useDispatch();
	const queue = useSelector((state) => state.music.tracks.queue);

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
					<div className={cx("track-container", wrapper)}>
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
							gutter={5}
							minWidth={"100%"}
							maxWidth={"1fr"}
						/>
					</div>
				</section>
			</div>
		</>
	);
}

const wrapper = css`
	margin: 3rem 0;
`;

export default Queue;
