import { api } from "../utils/api";
import { filterAlbums, doesTrackExistInAlbumsArray } from "../utils/filter";
import {
    FETCH_TRACKS_START,
    FETCH_TRACKS_SUCCESS,
    FETCH_TRACKS_FAILURE,
    SESSION_PLAY_TRACK,
    SESSION_PLAYING_TOGGLE,
    SESSION_VOLUME,
    SESSION_PLAYING_UPDATE_STATUS,
    UPDATE_USER_SEARCH,
    FILTER_TOGGLE_TAG,
} from "./actionTypes";

/*
 * Fetch albums index from api
 */
export const fetchAlbums = () => (dispatch) => {
    dispatch({ type: FETCH_TRACKS_START, payload: [] });

    api()
        .get("/tracks")
        .then((res) => {
            console.log("Tracks:", res.data);
            dispatch({ type: FETCH_TRACKS_SUCCESS, payload: res.data });
        })
        .catch((error) => {
            dispatch({ type: FETCH_TRACKS_FAILURE, payload: error });
        });
};

/*
 * Play a new track (adds to current session)
 */
export const playTrack = (trackIndex) => (dispatch) => {
    dispatch({ type: SESSION_PLAY_TRACK, payload: trackIndex });
};

/*
 * Play next track
 */
export const playNextTrack = (trackIndex) => (dispatch, getState) => {
    const state = getState();
    let newIndex = 0;

    // If a track is currently playing
    if (typeof newIndex === "number") {
        const tracks = state.music.tracks.data;

        // #1 attempt to play next track
        newIndex = trackIndex + 1;

        // If end of all tracks
        // loop to first track
        if (tracks.length <= newIndex) {
            // #3 loop entire playlist to first track
            newIndex = 0;
        }
    }

    // Select next track
    dispatch({ type: SESSION_PLAY_TRACK, payload: newIndex });
};

/*
 * Pause currently playing track
 */
export const playingTrackIsPaused = (isPaused) => (dispatch) => {
    dispatch({ type: SESSION_PLAYING_TOGGLE, payload: isPaused });
};

/*
 * Update status of playing track
 */
export const sessionUpdatePlayingStatus = (status) => (dispatch) => {
    dispatch({ type: SESSION_PLAYING_UPDATE_STATUS, payload: status });
};


/*
 * Change volume to an exact ammount (0/100)
 */
export const changeVolume = (newVolume) => (dispatch) => {
    dispatch({ type: SESSION_VOLUME, payload: newVolume });
};


/*
 * Update search input value
 */
export const updateUserSearch = (search) => (dispatch) => {
    dispatch({ type: UPDATE_USER_SEARCH, payload: search });
};


/*
 * Toggle filter tags array value
 */
export const filterToggleTag = (tag) => (dispatch, getState) => {
    const state = getState();
    const tags = [...state.music.tracks.filter.tags];
    let filteredData = [];

    // If tag already exists in tags array
    // -> remove it
    if (tags.includes(tag)) {
        const index = tags.indexOf(tag);
        if (index !== -1) tags.splice(index, 1);
    } else {
        // -> add tag
        tags.push(tag);
    }

    // Filter albums array to match new tags
    if (tags.length > 0) {
        filteredData = filterAlbums(
            state.music.tracks.data, { tags:tags, search:"" }
        ).map((key) => {
            return key;
        });
    }

    // Update tags array
    dispatch({ type: FILTER_TOGGLE_TAG, payload: {tags:tags, filteredData:filteredData} });
};
