import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useSelector, useDispatch } from "react-redux";

import { useColor } from "hooks";
import { api, getAlbum } from "utils";
import { playTrack, playingTrackIsPaused } from "store/actions";

import Image from "components/Image";
import Track from "components/Tracks/Track";

import { Icon } from "components/Icon";

function AlbumIndividual() {
    const dispatch = useDispatch();
    const color = useColor();

    const $albumCover = useRef(null);
    const $albumSide = useRef(null);

    // Album ID in URL
    const { id } = useParams();

    const tracksMap = useSelector((state) => state.music.tracksMap);
    const didError = useSelector((state) => state.music.didError);
    const isFetching = useSelector((state) => state.music.isFetching);
    const isPaused = useSelector((state) => state.session.playing.isPaused);
    const playingAlbum = useSelector(
        (state) => state.session.playing.track.id_album
    );

    // Search for album
    const album = getAlbum(id);

    // Is album playing
    let isAlbumPlaying = false;

    // Album exists
    if (album?.id && playingAlbum !== null && album?.id === playingAlbum)
        isAlbumPlaying = true;

    //
    const isLoading = !album?.id || isFetching || didError;

    // Build external links
    let linkSearch = "";
    let linkGoogle = "https://www.google.com/search?q=";
    let linkYoutube = "https://www.youtube.com/results?search_query=";
    let linkDiscogs = "https://www.discogs.com/search/?q=";

    if (!isLoading) {
        // prettier-ignore
        linkSearch = `${album.album_artist} - ${album.album}`;
        linkSearch = encodeURIComponent(linkSearch).replace(/%20/g, "+");
    }

    // Action button handler
    const handleActionButton = (e) => {
        e.stopPropagation();
        if (album) {
            if (!isAlbumPlaying) {
                // Play first track in album
                dispatch(playTrack(tracksMap[album.tracks[0]]));
            } else {
                // Pause track
                dispatch(playingTrackIsPaused(!isPaused));
            }
        }
    };

    // Create a floating album cover on scroll to keep the cover
    // in view if there are lots of tracks.
    const handleScroll = (e) => {
        if (isLoading || window.innerWidth < 1200) return false;

        if (window.scrollY > 100 && album.tracks.length >= 5) {
            $albumCover.current.style.position = "fixed";
            $albumCover.current.style.top = "100px";

            // Prevent album cover floating past tracks.
            // Calculate exactly where to stop album-cover - bottom of album-side.
            //
            // prettier-ignore
            let albumSideBottom = $albumSide.current.offsetTop + $albumSide.current.offsetHeight; // Side bottom position

            let albumCoverHeight = $albumCover.current.offsetHeight; // Cover height
            let albumCoverBottom =
                document.documentElement.scrollTop + 100 + albumCoverHeight; // Cover bottom position
            let albumCoverFinalPositionTop = albumSideBottom - albumCoverHeight;

            if (albumCoverBottom >= albumSideBottom) {
                $albumCover.current.style.position = "absolute";
                $albumCover.current.style.top = `${albumCoverFinalPositionTop}px`;
            }
        } else {
            $albumCover.current.style.position = "relative";
            $albumCover.current.style.top = "0px";
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isLoading]);

    // Jump to top of page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div className="AlbumIndividual container">
                <section>
                    <div className="album">
                        <div className="album-cover-wrapper">
                            <div
                                className="album-cover"
                                onClick={handleActionButton}
                                ref={$albumCover}
                            >
                                {isLoading ? (
                                    <Skeleton width={600} height={600} />
                                ) : (
                                    <Image
                                        src={
                                            isLoading
                                                ? "example"
                                                : api().getUri({
                                                      url: `/tracks/${album?.idCover}/cover/600`
                                                  })
                                        }
                                        fallback={`fallback--album-cover`}
                                        alt="album-cover"
                                        draggable="false"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="album-side" ref={$albumSide}>
                            <div className="album-metadata">
                                <h2>
                                    {isLoading ? (
                                        <Skeleton width={300} />
                                    ) : (
                                        album.album
                                    )}
                                </h2>
                                <p>
                                    {isLoading ? (
                                        <Skeleton width={200} />
                                    ) : (
                                        <>
                                            <span
                                                style={{
                                                    color: color
                                                }}
                                            >
                                                {album.year}
                                            </span>
                                            {" - "}
                                            {album.album_artist}
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="album-links">
                                <div className="album-links-link">
                                    <div
                                        className="album-links-link-background"
                                        style={{
                                            backgroundColor: color
                                        }}
                                    ></div>
                                    <a
                                        href={`${linkGoogle}${linkSearch}`}
                                        target="_blank"
                                        // title="Search Google for this track"
                                    >
                                        <div>
                                            <Icon name="logo-google" />
                                        </div>
                                    </a>
                                </div>
                                <div className="album-links-link">
                                    <div
                                        className="album-links-link-background"
                                        style={{
                                            backgroundColor: color
                                        }}
                                    ></div>
                                    <a
                                        href={`${linkYoutube}${linkSearch}`}
                                        target="_blank"
                                        // title="Search YouTube for this track"
                                    >
                                        <div>
                                            <Icon name="logo-youtube" />
                                        </div>
                                    </a>
                                </div>
                                <div className="album-links-link">
                                    <div
                                        className="album-links-link-background"
                                        style={{
                                            backgroundColor: color
                                        }}
                                    ></div>
                                    <a
                                        href={`${linkDiscogs}${linkSearch}`}
                                        target="_blank"
                                        // title="Search Discogs for this track"
                                    >
                                        <div>
                                            <Icon name="logo-discogs-vinyl" />
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div className="track-container">
                                {isLoading &&
                                    [...Array(8)].map((x, key) => (
                                        <Skeleton
                                            width={"80%"}
                                            height={"60px"}
                                            enableAnimation={false}
                                            key={key}
                                        />
                                    ))}

                                {!isLoading &&
                                    album.tracks.map((track, key) => {
                                        return (
                                            <Track
                                                index={tracksMap[track]}
                                                trackNumber={key + 1}
                                                key={key}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default AlbumIndividual;
