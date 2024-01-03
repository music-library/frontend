import React from "react";

import {
	ActiveUsers,
	PopularTracks,
	RandomSelection,
	RecentlyListenedTracks
} from "view/components";

export function Home() {
	return (
		<>
			<div className="Home container">
				<section>
					<RandomSelection />
				</section>
				<section>
					<PopularTracks />
				</section>
				<section>
					<RecentlyListenedTracks />
				</section>
				<section>
					<ActiveUsers />
				</section>
			</div>
		</>
	);
}

export default Home;
