// @ts-nocheck
import { expect } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";

import { injectGlobalLog } from "utils";

injectGlobalLog();
expect.extend(matchers);
