import React from "react";
import { animated, useSpring } from "react-spring";

export function AFCBackground({ color }) {
	const styles = useSpring({
		from: { height: 0, opacity: 0, backgroundColor: "#ffffff" },
		to: { height: 420, opacity: 0.5, backgroundColor: color }
	});

	return <animated.div className="afc-background" style={styles}></animated.div>;
}

export default AFCBackground;
