// @ts-nocheck
import matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";

import globalInit from "lib/global/index";

globalInit();
expect.extend(matchers);

vi.mock("@anephenix/sarus", () => ({
	default: vi.fn(() => {
		return {
			on: vi.fn(),
			off: vi.fn()
		};
	})
}));
