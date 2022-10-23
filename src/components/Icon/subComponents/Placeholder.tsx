import { memo, SVGProps } from "react";

export const Placeholder = memo((props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		{...props}
	>
		<circle fill="#eee" cx="12" cy="12" r="12" />
	</svg>
));
