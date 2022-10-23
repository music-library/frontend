import cx from "classnames";

import { Flex, FlexProps } from "components/layout/Flex";

interface StackProps extends FlexProps {
	spacing?:
		| 1
		| 2
		| 3
		| 4
		| 5
		| 6
		| 7
		| 8
		| 9
		| 10
		| 11
		| 12
		| 13
		| 14
		| 15
		| 16
		| 17
		| 18
		| 19
		| 20;
}

export const Stack = ({
	className,
	row = false,
	spacing = 1,
	...props
}: StackProps) => {
	return (
		<Flex
			className={cx(
				className,
				`${row ? "stack-row" : "stack"} stack-${spacing}`
			)}
			row={row}
			{...props}
		/>
	);
};
