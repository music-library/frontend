import axios from "axios";

import store from "store";

export const api = (library = undefined) => {
	if (!library) {
		const state = store.getState();
		library = state.music.library.selected;
	}

	return axios.create({
		baseURL: `${import.meta.env.REACT_APP_API}/lib`,
		headers: {
			"X-Library": library
		}
	});
};
