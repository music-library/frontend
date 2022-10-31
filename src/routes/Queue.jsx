import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { css } from "@linaria/core";
import cx from "classnames";

import { queueNew } from "store/actions";

import { GridDnd } from "components/layout";
import Track from "components/Tracks/Track";

function Queue() {
	const dispatch = useDispatch();
	const queue = useSelector((state) => state.music.tracks.queue);

	const [newQueue, setNewQueue] = useState(
		queue?.map((trackId) => {
			return {
				id: String(trackId)
			};
		})
	);

	// Update queue when newQueue changes
	useEffect(() => {
		dispatch(queueNew(newQueue.map((track) => Number(track.id))));
	}, [newQueue]);

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
								<Track
									index={props?.id}
									// size="compact"
									size="big"
									{...props}
								/>
							)}
							// grid
							gutter={5}
							minWidth={10000}
							maxWidth={10000}
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
