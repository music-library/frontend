import {
	LIBRARY_SWITCH,
	QUEUE_REMOVE,
	QUEUE_PUSH,
	QUEUE_NEW,
	UPDATE_USER_SEARCH,
	FILTER_TOGGLE_TAG,
	FILTER_RESET_TAGS
} from "./musicReducer";
import { SESSION_CLEAR } from "../session/sessionReducer";

export const switchLibrary = (library) => (dispatch) => {
	dispatch({ type: SESSION_CLEAR });
	dispatch({ type: LIBRARY_SWITCH, payload: library });
};

export const queueRemove = (trackId) => (dispatch) =>
	dispatch({ type: QUEUE_REMOVE, payload: trackId });

export const queuePush = (trackId) => (dispatch) =>
	dispatch({ type: QUEUE_PUSH, payload: trackId });

export const queueNew = (newQueue) => (dispatch) =>
	dispatch({ type: QUEUE_NEW, payload: newQueue });

export const updateUserSearch = (search) => (dispatch) =>
	dispatch({ type: UPDATE_USER_SEARCH, payload: search });

export const filterToggleTag = (tag) => (dispatch) =>
	dispatch({ type: FILTER_TOGGLE_TAG, payload: tag });

export const filterResetTags = () => (dispatch) =>
	dispatch({ type: FILTER_RESET_TAGS });
