import { css } from "@linaria/core";
import { animated, useTrail } from "@react-spring/web";
import cx from "classnames";
import { useLocation } from "react-router-dom";

import { useSelector } from "lib/hooks";
import { switchLibrary } from "state/actions";

export function SwitchLibrary() {
	const location = useLocation();
	const visible = location?.pathname === "/";
	const library = useSelector((state) => state.music.library);

	const trail = useTrail(library.options?.length, {
		from: { opacity: 0, y: 20 },
		to: { opacity: 1, y: 0 },
		reverse: !visible,
		config: { mass: 5, tension: 2000, friction: 200 }
	});

	return (
		<>
			{library.options?.length > 1 && (
				<div className={cx(libraryOptions, "tags")}>
					{trail.map((props, index) => {
						const option = library.options?.[index];
						if (!option?.id) return null;

						return (
							<animated.div
								key={option.id}
								className={cx(`tag`, {
									selected: library.selected === option.id
								})}
								onClick={() => {
									if (!visible) return;
									switchLibrary(option.id);
								}}
								style={{
									...props,
									cursor: visible ? "pointer" : "default"
								}}
							>
								{option.name}
							</animated.div>
						);
					})}
				</div>
			)}
		</>
	);
}

const libraryOptions = css`
	position: absolute;
	margin-left: -4px !important;
	margin-top: 13.6rem !important;
`;

export default SwitchLibrary;
