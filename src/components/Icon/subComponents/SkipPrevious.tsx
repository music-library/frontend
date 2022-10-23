import { memo, SVGProps } from "react";

export const SkipPrevious = memo((props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" />
	</svg>
));
