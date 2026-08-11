import { updateSlice } from "state/store";

import { getRandomColor } from "./colorStore";

/*
 * Sets a new random global color
 */
export const colorNext = () => {
	updateSlice("color", (color) => {
		color.current = getRandomColor();
	});
};
