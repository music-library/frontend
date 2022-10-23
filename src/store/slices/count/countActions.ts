import type { AppDispatch } from "store";
import * as types from "./countReducer";

export const countIncrement = (incrementAmount = 0.1) => {
	return (dispatch: AppDispatch) => {
		dispatch({ type: types.COUNT_INCREMENT, payload: incrementAmount });
	};
};
