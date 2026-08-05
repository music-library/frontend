const MAX_SCROLL_RESTORATIONS = 20;

export const albumScrollRestorations = new Map();

export const albumIdsAreEqual = (left = [], right = []) =>
	left.length === right.length &&
	left.every((albumId, index) => albumId === right[index]);

export const groupAlbumIdsIntoRows = (albumIds = [], columns = 1) => {
	const safeColumns = Math.max(1, columns);
	const rows = [];

	for (let index = 0; index < albumIds.length; index += safeColumns) {
		rows.push(albumIds.slice(index, index + safeColumns));
	}

	return rows;
};

export const getAlbumScrollRestoration = ({
	saved,
	navigationType,
	albumIds,
	columns,
	viewportWidth,
	gridWidth,
	offsetTop
}) => {
	if (navigationType !== "POP" || !saved) return { mode: "top" };

	const sameAlbums = albumIdsAreEqual(saved.albumIds, albumIds);
	const sameGridWidth =
		gridWidth == null || saved.width == null || Math.abs(saved.width - gridWidth) < 1;
	const sameOffset =
		offsetTop == null ||
		saved.offsetTop == null ||
		Math.abs(saved.offsetTop - offsetTop) < 1;
	const sameLayout =
		sameAlbums &&
		sameGridWidth &&
		sameOffset &&
		saved.columns === columns &&
		saved.viewportWidth === viewportWidth;

	if (sameLayout) {
		return {
			mode: "offset",
			offset: saved.scrollOffset
		};
	}

	if (albumIds.length === 0) return { mode: "top" };

	const savedAlbumIndex = albumIds.indexOf(saved.anchorAlbumId);
	const albumIndex =
		savedAlbumIndex >= 0
			? savedAlbumIndex
			: Math.min(saved.anchorAlbumIndex, albumIds.length - 1);

	return {
		mode: "anchor",
		rowIndex: Math.floor(Math.max(0, albumIndex) / Math.max(1, columns)),
		offsetWithinRow: saved.offsetWithinRow
	};
};

export const rememberAlbumScroll = (locationKey, restoration) => {
	albumScrollRestorations.delete(locationKey);
	albumScrollRestorations.set(locationKey, restoration);

	if (albumScrollRestorations.size > MAX_SCROLL_RESTORATIONS) {
		albumScrollRestorations.delete(albumScrollRestorations.keys().next().value);
	}
};
