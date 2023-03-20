import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { isMobile } from "react-device-detect";

import { fetchLibrary } from "store/actions";
import { useSelector, useDispatch } from "hooks";

import Audio from "./components/Audio/Audio";
import AudioControlBar from "./components/Audio/AudioControlBar";
import FloatingAlbumCover from "./components/FloatingAlbumCover";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import GlobalColor from "./components/GlobalColor";
import SocketGlobal from "./components/SocketGlobal";

import Home from "./routes/Home";
import Albums from "./routes/Albums";
import AlbumIndividual from "./routes/AlbumIndividual";
import Playlists from "./routes/Playlists";
import Tracks from "./routes/Tracks";
import Queue from "./routes/Queue";

import "./styles/index.scss";

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
                            <Route
                                path="/albums/:id"
                                element={<AlbumIndividual />}
                            />
                            <Route path="/queue" element={<Queue />} />
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
