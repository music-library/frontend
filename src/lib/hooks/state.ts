import { useSelector as useSelectorStore } from "@tanstack/react-store";
import { type RootState, store } from "state";

/**
 * State selector hook.
 *
 * Uses main store defined in `state/index.ts`.
 *
 * @example
 * const count = useSelector((state) => state.count.current);
 */
export const useSelector = <TSelected>(
	selector: (state: RootState) => TSelected
): TSelected => useSelectorStore(store, selector);
