import { memo, SVGProps } from "react";

export const Play = memo((props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
	</svg>
));
