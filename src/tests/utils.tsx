import { render } from "./render";

/**
 * Shorthand for `document.querySelector`.
 *
 * `const { container } = render(<Home />);`
 */
export const select = (input: Element | ReturnType<typeof render>, selectors: string) => {
	const el = input instanceof Element ? input : input?.container;
	return el.querySelector(selectors);
};

/**
 * Shorthand for `window.getComputedStyle`.
 */
export const getStyle = (el: Element | null): CSSStyleDeclaration => {
	if (!el) return {} as CSSStyleDeclaration;
	return window.getComputedStyle(el);
};
