import axios from "axios";

export const api = () => {
	return axios.create({
		baseURL: `${import.meta.env.REACT_APP_API}`,
	});
};
