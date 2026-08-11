import axios from "axios";

import { store } from "state/store";

export const api = (library = undefined) => {
	if (!library) {
		library = store.state.music.library.selected;
	}

	return axios.create({
		baseURL: `${import.meta.env.REACT_APP_API}/lib/${library}`,
		headers: {
			"X-Library": library
		}
	});
};
