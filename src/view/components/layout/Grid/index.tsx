import { css } from "@linaria/core";
import cx from "classnames";

export type GridProps = JSX.IntrinsicElements["div"] & {
	maxWidth?: string | number;
	minWidth?: string | number;
	center?: boolean;
	gutter?: number;
};

// Use `rem` if a number is passed, otherwise use the string as is.
const getUnit = (value: string | number) => {
	if (typeof value === "number") {
		return `${value}rem`;
	}

	return value;
};

export const Grid = ({
	center = false,
	children,
	className,
	gutter = 10,
	maxWidth = "1fr",
	minWidth = 20,
	...props
}: GridProps) => {
	// Specify the minimum width of each item in the grid,
	// if an item is smaller than this, the grid will remove a column to make it fit.
	// prettier-ignore
	const gridTemplateColumns = `repeat(auto-fit, minmax(min(100%, ${getUnit(minWidth)}), ${getUnit(maxWidth)}))`;

	return (
		<div
			{...props}
			className={cx(className, grid)}
			style={{
				gridGap: gutter,
				gridTemplateColumns: gridTemplateColumns,
				...(center && { justifyContent: "center" }),
				...props.style
			}}
		>
			{children}
		</div>
	);
};

const grid = css`
	position: relative;
	display: grid;
	width: 100%;
`;
