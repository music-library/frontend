import { COLOR_NEXT } from "./colorReducer";

/*
 * New global color
 */
export const colorNext = () => (dispatch) => {
	dispatch({ type: COLOR_NEXT });
};
