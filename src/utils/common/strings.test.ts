import { expect, test } from "vitest";
import { padChar, padZeros } from "./strings";

test("padChar", () => {
	expect(padChar("", 5, "!")).toBe("!!!!!");
	expect(padChar("hello", 5, "!", false)).toBe("hello");
	expect(padChar("hello", 10, " ", false)).toBe("     hello");
	expect(padChar(12345, 10, "!", false)).toBe("!!!!!12345");

	// append: true
	expect(padChar("", 5, "!", true)).toBe("!!!!!");
	expect(padChar("hello", 5, "!", true)).toBe("hello");
	expect(padChar("hello", 10, " ", true)).toBe("hello     ");
	expect(padChar(12345, 10, "!", true)).toBe("12345!!!!!");
});

test("padZeros", () => {
	expect(padZeros(123, -1)).toBe("123");
	expect(padZeros(123, 3)).toBe("123");
	expect(padZeros(123, 5)).toBe("00123");
	expect(padZeros(123456, 10)).toBe("0000123456");
});
