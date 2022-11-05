export const COLOR_NEXT = "COLOR_NEXT";
export const COLOR_UPDATE_CURRENT = "COLOR_UPDATE_CURRENT";

// Initial state of app
const initialState = {
	colors: [
		"#d5f1ff",
		"#cdfff5",
		"#cdffda",
		"#fcffcd",
		"#ffeecd",
		"#ffcde8",
		"#fccdff",
		"#d5e0ff"
	],
	current: Math.floor(Math.random() * 7) // Select a random color to start
};

const colorReducer = (state = initialState, action) => {
	switch (action.type) {
		case COLOR_UPDATE_CURRENT:
			return {
				...state,
				current: action.payload
			};

		case COLOR_NEXT:
			// Pick a random color
			// If the random color is the current color, increment color by one,
			// and loop back to the begining once finished
			let nextCurrent = Math.floor(Math.random() * 7);
			if (nextCurrent === state.current) {
				nextCurrent = state.current + 1;
				if (nextCurrent > state.colors.length - 1)
					nextCurrent = 0;
			}

			return {
				...state,
				current: nextCurrent
			};

		default:
			return state;
	}
};

export default colorReducer;
