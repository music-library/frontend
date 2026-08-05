import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	dispatch: vi.fn(),
	queueNew: vi.fn((payload) => ({ type: "QUEUE_NEW", payload })),
	state: {
		music: {
			queue: ["track-b", "track-a"],
			tracksMap: { "track-a": 0, "track-b": 1 },
			isFetching: false
		},
		session: {
			playing: { index: 0 }
		}
	}
}));

vi.mock("react-redux", () => ({
	useDispatch: () => mocks.dispatch,
	useSelector: (selector) => selector(mocks.state)
}));

vi.mock("lib/index", () => ({
	getNextTrack: vi.fn((trackIndex) => trackIndex + 1)
}));

vi.mock("state/actions", () => ({
	queueNew: mocks.queueNew
}));

vi.mock("react-spring", () => ({
	animated: {
		div: ({ children }) => <div>{children}</div>
	},
	useTrail: (length) => Array.from({ length }, () => ({}))
}));

vi.mock("view/components", () => ({
	Grid: ({ children }) => <div>{children}</div>,
	GridDnd: ({ data, renderWith: RenderWith, setData }) => (
		<div data-testid="queue-grid" data-track-ids={data.map(({ id }) => id).join(",")}>
			<button type="button" onClick={() => setData(() => [data[1], data[0]])}>
				reorder
			</button>
			{data.map((item) => <RenderWith key={item.id} {...item} />)}
		</div>
	),
	TrackBig: ({ id, index }) => (
		<div data-testid={id ? `queued-${id}` : `preview-${index}`} data-index={index} />
	)
}));

import { Queue } from "./index";

beforeEach(() => {
	vi.clearAllMocks();
});

test("renders queued IDs through tracksMap and preserves IDs when reordering", () => {
	render(<Queue />);

	expect(screen.getByTestId("queue-grid")).toHaveAttribute(
		"data-track-ids",
		"track-b,track-a"
	);
	expect(screen.getByTestId("queued-track-b")).toHaveAttribute("data-index", "1");
	expect(screen.getByTestId("queued-track-a")).toHaveAttribute("data-index", "0");

	fireEvent.click(screen.getByRole("button", { name: "reorder" }));

	expect(mocks.queueNew).toHaveBeenCalledWith(["track-a", "track-b"]);
	expect(mocks.dispatch).toHaveBeenCalledWith({
		type: "QUEUE_NEW",
		payload: ["track-a", "track-b"]
	});
});
