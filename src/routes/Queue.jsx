import { css } from "@linaria/core";

import Queue from "components/Queue";

function QueuePage() {
	return (
		<>
			<div className="Queue container">
				<section>
					<h2>Queue</h2>
					<Queue className={tracksWrapper} />
				</section>
			</div>
		</>
	);
}

const tracksWrapper = css`
	margin: 3rem 0;
`;

export default QueuePage;
