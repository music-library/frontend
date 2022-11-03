/**
 * Use char(s) to pad an input string/number to a certain length.
 */
export function padChar(
    str: string | number,
    size: number,
    char: string,
    append = false
): string {
    str = String(str);
    while (str.length < size) str = append ? str + char : char + str;
    return str;
}

/**
 * Pad an input number with `0`s to maintain a desired length.
 *
 * Alias of `padChar`.
 */
export function padZeros(num: string | number, size: number): string {
    return padChar(num, size, "0", false);
}

/**
 * A wrapper for `JSON.parse()` to support `undefined` value
 */
export const parseJSON = <T>(value: string | null): T | undefined => {
    try {
        return value === "undefined" ? undefined : JSON.parse(value ?? "");
    } catch {
        console.warn("[parseJSON]", value);
        return undefined;
    }
};
