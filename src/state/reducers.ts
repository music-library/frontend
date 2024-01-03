import { combineReducers } from "redux";

import color from "./slices/color/colorReducer";
import music from "./slices/music/musicReducer";
import session from "./slices/session/sessionReducer";
import socket from "./slices/socket/socketReducer";

const rootReducer = combineReducers({
	color,
	music,
	session,
	socket
});

export default rootReducer;
