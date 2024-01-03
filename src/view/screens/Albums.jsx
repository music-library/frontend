import React from "react";

import { AlbumList, Tags } from "view/components";

export function Albums() {
	return (
		<>
			<div className="Albums container">
				<section>
					<h2>Albums</h2>
					<Tags />
					<AlbumList />
				</section>
			</div>
		</>
	);
}

export default Albums;
