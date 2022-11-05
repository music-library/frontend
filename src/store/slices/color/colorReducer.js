import Chance from 'chance';
const chance = new Chance();

export const COLOR_NEXT = "COLOR_NEXT";
export const COLOR_UPDATE_CURRENT = "COLOR_UPDATE_CURRENT";

const colors = [
	"#d5f1ff",
	"#cdfff5",
	"#cdffda",
	"#fcffcd",
	"#ffeecd",
	"#d5e0ff",
	// New
	"#97b9ed",
	"#a3a2ff",
	"#FFFFFF",
	"#FFE799",
	"#F8B47C"
];

// Initial state of app
const initialState = {
	colors,
	current: chance.integer({ min: 0, max: colors.length - 1 }) // Select a random color to start
};

const colorReducer = (state = initialState, action) => {
	switch (action.type) {
		case COLOR_UPDATE_CURRENT:
			return {
				...state,
				current: action.payload
			};

		case COLOR_NEXT:
			// Pick a random color (not the current one)
			let nextCurrent = state.current;
			while (nextCurrent === state.current) {
				nextCurrent = chance.integer({ min: 0, max: colors.length - 1 });
				if (colors?.length <= 1) break;
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
