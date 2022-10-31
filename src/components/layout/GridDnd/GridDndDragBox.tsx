import { css } from "@linaria/core";

export type GridDndDragBoxProps = {
	dataItem: any;
	renderWith: (props: any) => JSX.Element;
};

/**
 * Drop target box for the grid.
 *
 * Renders element in a hidden state. This is to prevent layout issues,
 * such as an incorrect height of the GridDndDragBox.
 */
export default function GridDndDragBox({
	dataItem,
	renderWith
}: GridDndDragBoxProps) {
	const RenderWith = renderWith;

	return (
		<div className={gridDragbox}>
			<RenderWith {...dataItem} />
		</div>
	);
}

const gridDragbox = css`
	position: relative;
	display: table;
	height: 100%;
	width: 100%;

	// Hide all children.
	// This ensures the content height is preserved and fixes layout issues when rendering.
	* {
		opacity: 0 !important;
	}
`;
