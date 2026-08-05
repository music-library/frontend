// @ts-nocheck
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

import globalInit from "lib/global/index";

globalInit();
vi.mock("@anephenix/sarus", () => ({
	default: vi.fn(function SarusMock() {
		this.on = vi.fn();
		this.off = vi.fn();
	})
}));
