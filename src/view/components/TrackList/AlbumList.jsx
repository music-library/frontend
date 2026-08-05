import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigationType } from "react-router-dom";

import { filterTracks, groupTracksIntoAlbums, numberOfAlbumsOnOneRow } from "lib/index";

import Album from "../Tracks/Album";
import {
	albumIdsAreEqual,
	albumScrollRestorations,
	getAlbumScrollRestoration,
	groupAlbumIdsIntoRows,
	rememberAlbumScroll
} from "./AlbumList.utils";

const ALBUM_GRID_COLUMNS_PROPERTY = "--album-grid-columns";
const ALBUM_ROW_GAP = 10;
const ALBUM_METADATA_HEIGHT_ESTIMATE = 74;

const estimateAlbumRowHeight = (gridWidth, columns) => {
	if (gridWidth <= 0) return 320;

	const albumWidth =
		(gridWidth - ALBUM_ROW_GAP * Math.max(0, columns - 1)) / Math.max(1, columns);

	return albumWidth + ALBUM_METADATA_HEIGHT_ESTIMATE;
};

const useAlbumGridMetrics = (gridRef) => {
	const [metrics, setMetrics] = useState(() => ({
		columns: numberOfAlbumsOnOneRow(),
		offsetTop: 0,
		width: 0
	}));

	useLayoutEffect(() => {
		const grid = gridRef.current;
		if (!grid) return undefined;

		const measureGrid = () => {
			const bounds = grid.getBoundingClientRect();
			const computedColumns = Number.parseInt(
				window
					.getComputedStyle(grid)
					.getPropertyValue(ALBUM_GRID_COLUMNS_PROPERTY),
				10
			);
			const nextMetrics = {
				columns: Number.isFinite(computedColumns)
					? computedColumns
					: numberOfAlbumsOnOneRow(),
				offsetTop: bounds.top + window.scrollY,
				width: bounds.width
			};

			setMetrics((currentMetrics) => {
				if (
					currentMetrics.columns === nextMetrics.columns &&
					currentMetrics.offsetTop === nextMetrics.offsetTop &&
					currentMetrics.width === nextMetrics.width
				) {
					return currentMetrics;
				}

				return nextMetrics;
			});
		};

		measureGrid();
		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(measureGrid);
		resizeObserver?.observe(grid);
		window.addEventListener("resize", measureGrid);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener("resize", measureGrid);
		};
	}, [gridRef]);

	return metrics;
};

function LoadingAlbumGrid() {
	const gridRef = useRef(null);
	const { columns } = useAlbumGridMetrics(gridRef);

	return (
		<div
			className="track-container grid grid-albums album-grid-loading"
			ref={gridRef}
		>
			{[...Array(columns * 4)].map((x, key) => (
				<Album key={key} />
			))}
		</div>
	);
}

function VirtualAlbumGrid({ albumIds, albumsMap }) {
	const gridRef = useRef(null);
	const location = useLocation();
	const navigationType = useNavigationType();
	const [initialColumns] = useState(() => numberOfAlbumsOnOneRow());
	const [savedRestoration] = useState(() => albumScrollRestorations.get(location.key));
	const [initialRestoration] = useState(() =>
		getAlbumScrollRestoration({
			saved: savedRestoration,
			navigationType,
			albumIds,
			columns: initialColumns,
			viewportWidth: window.innerWidth
		})
	);
	const { columns, offsetTop, width } = useAlbumGridMetrics(gridRef);
	const rows = useMemo(
		() => groupAlbumIdsIntoRows(albumIds, columns),
		[albumIds, columns]
	);
	const getRowKey = useCallback(
		(rowIndex) => `${columns}:${rows[rowIndex]?.[0] || rowIndex}`,
		[columns, rows]
	);

	const rowVirtualizer = useWindowVirtualizer({
		count: rows.length,
		estimateSize: () => estimateAlbumRowHeight(width, columns),
		gap: ALBUM_ROW_GAP,
		getItemKey: getRowKey,
		initialMeasurementsCache:
			initialRestoration.mode === "offset"
				? savedRestoration?.measurements || []
				: [],
		initialOffset:
			initialRestoration.mode === "offset" ? initialRestoration.offset : 0,
		overscan: 2,
		scrollMargin: offsetTop
	});

	const latestState = useRef(null);
	const capturedBeforeNavigation = useRef(false);
	useLayoutEffect(() => {
		latestState.current = {
			albumIds,
			columns,
			offsetTop,
			rowVirtualizer,
			width
		};
	}, [albumIds, columns, offsetTop, rowVirtualizer, width]);

	const previousMetrics = useRef({ columns, width });
	useLayoutEffect(() => {
		const previous = previousMetrics.current;
		if (
			previous.width > 0 &&
			(previous.columns !== columns || previous.width !== width)
		) {
			rowVirtualizer.measure();
		}
		previousMetrics.current = { columns, width };
	}, [columns, rowVirtualizer, width]);

	const restorationComplete = useRef(false);
	useLayoutEffect(() => {
		if (restorationComplete.current || width <= 0) return undefined;

		const restoration = getAlbumScrollRestoration({
			saved: savedRestoration,
			navigationType,
			albumIds,
			columns,
			viewportWidth: window.innerWidth,
			gridWidth: width,
			offsetTop
		});
		let animationFrame;

		if (restoration.mode === "offset") {
			rowVirtualizer.scrollToOffset(restoration.offset, { behavior: "auto" });
			animationFrame = window.requestAnimationFrame(() => {
				rowVirtualizer.scrollToOffset(restoration.offset, { behavior: "auto" });
			});
		} else if (restoration.mode === "anchor") {
			const restoreAnchor = () => {
				rowVirtualizer.scrollToIndex(restoration.rowIndex, {
					align: "start",
					behavior: "auto"
				});
				window.scrollBy(0, restoration.offsetWithinRow);
			};

			restoreAnchor();
			animationFrame = window.requestAnimationFrame(restoreAnchor);
		} else {
			window.scrollTo(0, 0);
		}

		restorationComplete.current = true;
		return () => window.cancelAnimationFrame(animationFrame);
	}, [
		albumIds,
		columns,
		navigationType,
		offsetTop,
		rowVirtualizer,
		savedRestoration,
		width
	]);

	const previousAlbumIds = useRef(albumIds);
	useEffect(() => {
		if (albumIdsAreEqual(previousAlbumIds.current, albumIds)) return;

		previousAlbumIds.current = albumIds;
		albumScrollRestorations.delete(location.key);
		rowVirtualizer.measure();
		rowVirtualizer.scrollToOffset(0, { behavior: "auto" });
	}, [albumIds, location.key, rowVirtualizer]);

	const captureScrollRestoration = useCallback(() => {
		const current = latestState.current;
		if (!current || current.albumIds.length === 0) return false;

		const scrollOffset = window.scrollY;
		const virtualRows = current.rowVirtualizer.getVirtualItems();
		const anchorRow =
			virtualRows.find((row) => row.end > scrollOffset) ||
			virtualRows[virtualRows.length - 1];
		const anchorRowIndex = anchorRow?.index || 0;
		const anchorAlbumIndex = Math.min(
			anchorRowIndex * current.columns,
			current.albumIds.length - 1
		);

		rememberAlbumScroll(location.key, {
			albumIds: [...current.albumIds],
			anchorAlbumId: current.albumIds[anchorAlbumIndex],
			anchorAlbumIndex,
			columns: current.columns,
			measurements: current.rowVirtualizer.takeSnapshot(),
			offsetTop: current.offsetTop,
			offsetWithinRow: anchorRow ? scrollOffset - anchorRow.start : 0,
			scrollOffset,
			viewportWidth: window.innerWidth,
			width: current.width
		});

		return true;
	}, [location.key]);

	const captureBeforeAlbumNavigation = useCallback(() => {
		capturedBeforeNavigation.current = captureScrollRestoration();
	}, [captureScrollRestoration]);

	useEffect(() => {
		return () => {
			if (!capturedBeforeNavigation.current) captureScrollRestoration();
		};
	}, [captureScrollRestoration]);

	return (
		<div
			className="track-container grid grid-albums album-grid-virtualized"
			ref={gridRef}
		>
			<div
				className="album-grid-virtualizer"
				style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => (
					<div
						className="album-grid-row"
						data-index={virtualRow.index}
						key={virtualRow.key}
						ref={rowVirtualizer.measureElement}
						style={{
							transform: `translateY(${virtualRow.start - offsetTop}px)`
						}}
					>
						{rows[virtualRow.index].map((albumId) => (
							<Album
								albumId={albumId}
								albumTracks={albumsMap?.[albumId]}
								key={albumId}
								onNavigate={captureBeforeAlbumNavigation}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export function AlbumList() {
	const tracks = useSelector((state) => state.music.tracks);
	const filter = useSelector((state) => state.music.filter);
	const filteredData = useSelector((state) => state.music.filteredData);
	const albumsMap = useSelector((state) => state.music.albumsMap);
	const isFetching = useSelector((state) => state.music.isFetching);
	const didError = useSelector((state) => state.music.didError);
	const isLoading = isFetching || didError;

	const albumIds = useMemo(() => {
		const tracksData = filter.tags.length > 0 ? filteredData : tracks;
		const tracksFiltered = filterTracks(tracks, tracksData, filter, true);
		return groupTracksIntoAlbums(tracksFiltered);
	}, [filter, filteredData, tracks]);

	if (isLoading) return <LoadingAlbumGrid />;

	return <VirtualAlbumGrid albumIds={albumIds} albumsMap={albumsMap} />;
}

export default AlbumList;
