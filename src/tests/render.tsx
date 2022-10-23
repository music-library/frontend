import { ReactElement, JSXElementConstructor } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render as reactRender } from "@testing-library/react";

import store from "store";

type element = ReactElement<any, string | JSXElementConstructor<any>>;

type children = {
	children: element;
};

export const render = (ui: element, route = "") => {
	const Wrapper = ({ children }: children) => {
		return (
			<Provider store={store}>
				<MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
			</Provider>
		);
	};

	return reactRender(ui, { wrapper: Wrapper });
};

export const renderBasic = (ui: element) => {
	const Wrapper = ({ children }: children) => {
		return <Provider store={store}>{children}</Provider>;
	};

	return reactRender(ui, { wrapper: Wrapper });
};
