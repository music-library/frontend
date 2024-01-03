import { cx } from "@linaria/core";

export type FlexProps = JSX.IntrinsicElements["div"] & {
	center?: boolean;
	grow?: boolean;
	row?: boolean;
	shrink?: boolean;
	wrap?: boolean;
	vc?: boolean;
	hc?: boolean;
};

export const Flex = ({
	center = false,
	grow = false,
	row = false,
	shrink = false,
	wrap = false,
	vc = false,
	hc = false,
	className,
	...rest
}: FlexProps) => {
	return (
		<div
			className={cx(
				className,
				"flex",
				center && "center",
				grow && "grow",
				row && "row",
				shrink && "shrink",
				wrap && "wrap",
				vc && "v-center",
				hc && "h-center"
			)}
			{...rest}
		/>
	);
};
