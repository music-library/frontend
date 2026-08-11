import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import { Route, Routes } from "react-router-dom";

import { useDispatch, useSelector } from "lib/hooks";
import { fetchLibrary } from "state/actions";

import {
	Audio,
	AudioControlBar,
	FloatingAlbumCover,
	Footer,
	GlobalColor,
	NavBar,
	SocketGlobal
} from "view/components";
import {
	AlbumIndividual,
	Albums,
	Home,
	Playlists,
	QueuePage,
	Tracks
} from "view/screens";

function App() {
	const dispatch = useDispatch();
	const libraryId = useSelector((state) => state.music.library.selected);
	const sessionTrack = useSelector((state) => state.session.playing.track);

	// Fetch tracks index from api
	useEffect(() => {
		dispatch(fetchLibrary(libraryId));
	}, [libraryId]);

	// Update title with currently playing track
	useEffect(() => {
		if (sessionTrack.id) {
			document.title = `${sessionTrack.metadata.artist} - ${sessionTrack.metadata.title} | Music Library`;
		}
	}, [sessionTrack]);

	return (
		<>
			<Audio />
			<SocketGlobal />
			<div className={`App ${isMobile ? "is-mobile" : "is-desktop"}`}>
				<div className="app-wrapper">
					{/* Navbar + Navlinks & Title + Search-bar */}
					<NavBar />

					{/* Routes */}
					<div className="app-page">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/albums" element={<Albums />} />
							<Route path="/albums/:id" element={<AlbumIndividual />} />
							<Route path="/queue" element={<QueuePage />} />
							<Route path="/playlists" element={<Playlists />} />
							<Route path="/tracks" element={<Tracks />} />
						</Routes>
					</div>

					{/* Audio Control Bar */}
					<AudioControlBar render={["all"]} />
					{window.innerWidth < 750 && (
						<AudioControlBar render={["track"]} offset={true} />
					)}

					{/* MISC elements with position fixed/absolute */}
					<FloatingAlbumCover />
					<GlobalColor />
					{/* <AFCBackgroundMulti /> */}

					{/* Footer */}
					<Footer />
				</div>
			</div>
		</>
	);
}

export default App;
