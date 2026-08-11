import { ReactElement, JSXElementConstructor } from "react";
import { MemoryRouter } from "react-router-dom";
import { render as reactRender } from "@testing-library/react";

export type Element = ReactElement<any, string | JSXElementConstructor<any>>;

type WrapperType = JSXElementConstructor<{
	children: React.ReactNode;
}>;

type children = {
	children: Element;
};

const internalTestId = "__routerHasMounted";

export const render = (ui: Element, route = "") => {
	const Wrapper = ({ children }: children) => {
		return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
	};

	return reactRender(ui, { wrapper: Wrapper });
};

export const renderBasic = (ui: Element) => {
	const Wrapper: WrapperType = ({ children }) => {
		return <div data-testid={internalTestId}>{children}</div>;
	};

	return reactRender(ui, { wrapper: Wrapper });
};
