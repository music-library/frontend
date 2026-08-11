import { isMobile } from "lib/device";
import { parseJSON } from "lib/strings";

export interface ISessionStore {
	actions: {
		shuffle?: boolean;
		repeat?: boolean;
		showPip?: boolean;
	};
	playing: {
		audioRef: any;
		didError?: boolean;
		playbackFailure: any;
		isPaused?: boolean;
		status: {
			duration: any;
			position: any;
			isMute: boolean;
			volume: number;
		};
		index: number;
		track: {
			id?: any;
			id_album?: any;
			metadata: Record<string, any>;
		};
	};
	selected: Record<string, any>;
}

export const sessionStore: ISessionStore = {
	actions: {
		shuffle: false,
		repeat: false,
		showPip: false // picture-in-picture
	},
	playing: {
		audioRef: {},
		didError: false,
		playbackFailure: null,
		isPaused: true,
		status: {
			duration: null,
			position: null,
			isMute: false,
			volume: isMobile ? 100 : (parseJSON(localStorage.getItem("volume")) ?? 50)
		},
		index: -1,
		track: {
			id: null,
			id_album: null,
			metadata: {}
		}
	},
	selected: {}
};

export default sessionStore;
