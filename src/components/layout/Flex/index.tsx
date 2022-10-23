export interface FlexProps {
	center?: boolean;
	grow?: boolean;
	row?: boolean;
	shrink?: boolean;
	wrap?: boolean;
	vc?: boolean;
	hc?: boolean;
	[x: string]: any;
}

export const Flex = ({
	center = false,
	grow = false,
	row = false,
	shrink = false,
	wrap = false,
	vc = false,
	hc = false,
	...rest
}: FlexProps) => {
	rest.className = rest?.className ? (rest.className += " flex") : "flex";
	center && (rest.className += " center");
	grow && (rest.className += " grow");
	row && (rest.className += " row");
	shrink && (rest.className += " shrink");
	wrap && (rest.className += " wrap");
	vc && (rest.className += " v-center");
	hc && (rest.className += " h-center");
	return <div {...rest} />;
};
