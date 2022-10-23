export const COUNT_INCREMENT = "COUNT_INCREMENT";

type countState = {
	current: number | string;
};

const initialState: countState = {
	current: 0
};

const countReducer = (state = initialState, action: any): countState => {
	switch (action.type) {
		case COUNT_INCREMENT:
			return {
				...state,
				current: (
					Number(state.current) + Number(action.payload)
				).toFixed(2)
			};

		default:
			return state;
	}
};

export default countReducer;
