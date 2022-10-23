import { memo, SVGProps } from "react";

export const Minus = memo((props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M19,13H5V11H19V13Z" />
	</svg>
));
