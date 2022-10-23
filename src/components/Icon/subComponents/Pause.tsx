import { memo, SVGProps } from "react";

export const Pause = memo((props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
	</svg>
));
