import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Chance from "chance";

import { nRowsOfAlbums } from "utils/sortTracks";

import Album from "./Tracks/Album";

function RandomSelection() {
    // Get albums list from store
    const albumsMap = useSelector((state) => state.music.albumsMap);
    const albumsMapKeys = Object.keys(albumsMap);
    const [albumsToRender, setAlbumsToRender] = useState([-1, -1, -1, -1]);

    // Generate up-to 10 - unique - random numbers (used as album indexes)
    useEffect(() => {
        const chance = new Chance();
        let albumsAmmount = nRowsOfAlbums(1);
        if (albumsAmmount === 2) albumsAmmount = 4;
        let albumsMaxIndex = albumsAmmount - 1;
        if (albumsMap.length > 0) albumsMaxIndex = albumsMap.length - 1;
        if (albumsMap.length > 0 && albumsMap.length < albumsAmmount)
            albumsAmmount = albumsMap.length;

        setAlbumsToRender(
            chance.unique(chance.integer, albumsAmmount, {
                min: 0,
                max: albumsMaxIndex
            })
        );
    }, [albumsMap.length]);

    return (
        <div className="random-selection">
            <h2>Random Selection</h2>
            <div className="track-container grid grid-albums">
                {albumsToRender.map((albumIndex, index) => {
                    const albumId = albumsMapKeys[albumIndex];

                    if (typeof albumsMap[albumId] !== "undefined") {
                        return (
                            <Album
                                albumId={albumId}
                                albumTracks={albumsMap[albumId]}
                                key={index}
                            />
                        );
                    }

                    return (
                        <Album albumId={false} albumTracks={[]} key={index} />
                    );
                })}
            </div>
        </div>
    );
}

export default RandomSelection;
