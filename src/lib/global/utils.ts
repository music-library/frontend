/**
 * Returns global object to use.
 *
 * Aims to work in both the browser and node.
 */
export const getGlobal = () => {
	return globalThis;
};

export const $global = getGlobal();
