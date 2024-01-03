import { memo, SVGProps } from "react";

export const SkipNext = memo((props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" />
	</svg>
));
