import Chance from "chance";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useLibraryAlbums } from "catalog";
import { nRowsOfAlbums } from "lib/index";

import Album from "./Tracks/Album";

export function RandomSelection() {
	const libraryId = useSelector((state) => state.music.library.selected);
	const { data: albums = [] } = useLibraryAlbums(libraryId);
	const [albumsToRender, setAlbumsToRender] = useState([]);

	useEffect(() => {
		if (albums.length === 0) {
			setAlbumsToRender([]);
			return;
		}
		let amount = nRowsOfAlbums(1);
		if (amount === 2) amount = 4;
		amount = Math.min(amount, albums.length);
		const chance = new Chance();
		const indexes = chance.unique(chance.integer, amount, {
			min: 0,
			max: albums.length - 1
		});
		setAlbumsToRender(indexes.map((index) => albums[index]));
	}, [albums]);

	return (
		<div className="random-selection">
			<h2>Random Selection</h2>
			<div className="track-container grid grid-albums">
				{albumsToRender.map((album) => <Album album={album} key={album.id} />)}
			</div>
		</div>
	);
}

export default RandomSelection;
