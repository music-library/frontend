import React from "react";
import { useSelector } from "react-redux";

export function Footer() {
	const trackId = useSelector((state) => state.session.playing.trackId);

	const styles = { marginBottom: 120 };

	// Change Footer margin if a track is playing.
	// This is to keep the margin consistent when the AudioControlBar is active
	if (trackId) {
		styles.marginBottom = 120 + 70;
	}

	return (
		<div className="footer" style={styles}>
			<hr />
			<p>
				Music Library <small>@ {new Date().getFullYear()}</small>
			</p>
		</div>
	);
}

export default Footer;
