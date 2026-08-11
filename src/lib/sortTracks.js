export const numberOfAlbumsOnOneRow = () => {
	const width = window.innerWidth;
	if (width < 800) return 2;
	if (width < 1100) return 3;
	if (width < 1500) return 4;
	if (width < 1800) return 5;
	return 7;
};

export const numberOfTracksOnOneRow = () => {
	const width = window.innerWidth;
	if (width < 850) return 1;
	if (width < 1400) return 2;
	if (width < 1800) return 3;
	return 4;
};

export const nRowsOfAlbums = (rows) => numberOfAlbumsOnOneRow() * rows;
export const nRowsOfTracks = (rows) => numberOfTracksOnOneRow() * rows;
