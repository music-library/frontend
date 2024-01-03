import { useSelector } from "lib/hooks";

/**
 * Returns the current color from the store.
 */
export function useColor() {
	const colors = useSelector((state) => state.color.colors);
	const colorIndex = useSelector((state) => state.color.current);
	return colors[colorIndex];
}
