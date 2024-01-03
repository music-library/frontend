import React from "react";

import { Tags, TrackList } from "view/components";

export function Tracks() {
	return (
		<>
			<div className="Tracks container">
				<section>
					<h2>Tracks</h2>
					<Tags />
					<TrackList />
				</section>
			</div>
		</>
	);
}

export default Tracks;
