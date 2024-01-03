import { $global } from "./utils";

export const getNumberOfEventListeners = () => {
	try {
		if (typeof window === "undefined" || !(window as any)?.getEventListeners)
			return -1;
		const events = (window as any).getEventListeners(window);
		let pre = 0;
		Object.keys(events).forEach(function (evt) {
			pre += events?.[evt]?.length || 0;
		});
		return pre;
	} catch (e) {
		return -1;
	}
};

export const getObjectOfEventListeners = () => {
	try {
		if (typeof window === "undefined" || !(window as any)?.getEventListeners)
			return {};
		return Array.from(document.querySelectorAll("*")).reduce(
			function (pre: any, dom: any) {
				const evtObj = (window as any).getEventListeners(dom);
				Object.keys(evtObj).forEach(function (evt) {
					if (typeof pre[evt] === "undefined") {
						pre[evt] = 0;
					}
					pre[evt] += evtObj[evt].length;
					pre["_total"] += evtObj[evt].length;
				});
				return pre;
			},
			{ _total: 0 }
		);
	} catch (e) {
		return {};
	}
};

export const injectDevTools = () => {
	$global.getNumberOfEventListeners = getNumberOfEventListeners;
	$global.getObjectOfEventListeners = getObjectOfEventListeners;
};
