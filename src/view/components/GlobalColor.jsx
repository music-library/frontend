import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { useInterval } from "lib/hooks";
import { colorNext } from "state/actions";

export function GlobalColor() {
	const dispatch = useDispatch();
	const location = useLocation();

	const [currentPath, setCurrentPath] = useState(window.location.pathname);

	const updateGlobalColor = () => {
		dispatch(colorNext());
	};

	// Update global color every 30 seconds
	useInterval(() => {
		updateGlobalColor();
	}, 30000);

	// Update global color on URL change
	useEffect(() => {
		if (location.pathname !== currentPath) {
			setCurrentPath(location.pathname);
			updateGlobalColor();
		}
	}, [location]);

	return <></>;
}

export default GlobalColor;
