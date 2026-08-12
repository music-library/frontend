import { css } from "@linaria/core";

import { useColor } from "lib/hooks";
import { applyUpdate, useUpdateAvailable } from "state/actions";

import { Icon } from "view/components";

export function UpdateIcon() {
	const color = useColor();
	const updateAvailable = useUpdateAvailable();

	return (
		<>
			{!!updateAvailable && (
				<div
					className={updateIcon}
					title="Update"
					onClick={() => applyUpdate(true)}
				>
					<Icon name="update" fill={color} />
				</div>
			)}
		</>
	);
}

const updateIcon = css`
	position: relative;
	width: 5rem;
	height: 5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 100%;
	will-change: background-color;
	background-color: transparent;
	transition: background-color 80ms;
	cursor: pointer;

	&:hover {
		background-color: rgba(75, 75, 75, 0.7);
	}

	@media screen and (max-width: 500px) {
		width: 4rem;
		height: 4rem;

		svg {
			width: 2rem;
			height: 2rem;
		}
	}

	@media screen and (max-width: 370px) {
		width: 3.5rem;
		height: 3.5rem;

		svg {
			width: 1.7rem;
			height: 1.7rem;
		}
	}
`;

export default UpdateIcon;
