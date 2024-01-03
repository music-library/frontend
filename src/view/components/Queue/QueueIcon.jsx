import { css } from "@linaria/core";

import { useColor, useSelector } from "lib/hooks";

import { Icon } from "view/components";

// @TODO: Use this component and remove queue from NavLinks

function QueueIcon() {
	const color = useColor();
	const queue = useSelector((state) => state.music.queue);

	return (
		<div className={styles}>
			<Icon name="playlist" fill="#e4e4e4" />

			{!!queue?.length && (
				<div className={queueCount} style={{ background: color }}>
					{queue?.length}
				</div>
			)}
		</div>
	);
}

const styles = css`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 5rem;
	height: 5rem;
	border-radius: 100%;
	background: #464646;
`;

const queueCount = css`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	top: -2px;
	right: -2px;
	width: 17px;
	height: 17px;
	color: #000000;
	background: gray;
	border-radius: 100%;
	transition: all 200ms ease;
`;

export default QueueIcon;
