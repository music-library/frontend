import React from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { isMobile } from "react-device-detect";
import { useSelector, useDispatch } from "react-redux";

import { api } from "utils";
import { useColor } from "hooks";
import { playTrack, playingTrackIsPaused } from "store/actions";

import Image from "../Image";
import { Icon } from "components/Icon";

function Album({ albumId = false, albumTracks = [] }) {
    const dispatch = useDispatch();
    const color = useColor();

    const playingAlbum = useSelector(
        (state) => state.session.playing.track.id_album
    );
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const tracksMap = useSelector((state) => state.music.tracksMap);
    const tracks = useSelector((state) => state.music.tracks);

    // If api call failed
    const didError = useSelector((state) => state.music.tracks.didError);

    // Is album playing
    let isAlbumPlaying = false;

    // Assume loading state
    let isLoading = true;
    let albumName = <Skeleton width={"88%"} />;
    let albumArtist = <Skeleton width={"60%"} />;
    let albumCoverId = "example";

    // Album exists
    if (albumId && albumTracks.length > 0) {
        isLoading = false;
        const track = tracks?.[tracksMap?.[albumTracks?.[0]]];
        albumName = track?.metadata?.album;
        albumArtist = track?.metadata?.album_artist;
        albumCoverId = track?.id;
        if (albumId == playingAlbum) isAlbumPlaying = true;
    }

    // Goto album url
    const handleAlbumClick = (e) => {
        if (!albumId) e.preventDefault();
    };

    // Action button handler
    const handleActionButton = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAlbumPlaying) {
            // Play first track in album
            dispatch(playTrack(album.tracks[0]));
        } else {
            // Pause track
            dispatch(playingTrackIsPaused(!isPaused));
        }
    };

    // Dynamic class list
    let classList = "";
    classList += isAlbumPlaying ? " playing" : "";
    classList += isLoading ? " loading" : "";
    classList += didError ? " error" : "";

    return (
        <Link
            to={albumId ? `/albums/${albumId}` : `#`}
            onClick={handleAlbumClick}
        >
            <div className={`album${classList}`}>
                <div className="album-cover">
                    <Image
                        src={api().getUri({
                            url: `/lib/main/tracks/${albumCoverId}/cover/600`
                        })}
                        fallback={`fallback--album-cover`}
                        alt="album-cover"
                        draggable="false"
                    />
                    <div
                        className="album-action"
                        onClick={handleActionButton}
                        style={{ opacity: isMobile && 1 }}
                    >
                        <div className="album-action-button">
                            {!isAlbumPlaying || isPaused ? (
                                <Icon
                                    name="play"
                                    fill={
                                        isAlbumPlaying && isPaused
                                            ? color
                                            : "#fff"
                                    }
                                />
                            ) : (
                                <Icon name="pause" fill={color} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="album-metadata">
                    <div className="album-metadata-album">
                        <p>{albumName}</p>
                    </div>
                    <div className="album-metadata-artist">
                        <p>{albumArtist}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default Album;
