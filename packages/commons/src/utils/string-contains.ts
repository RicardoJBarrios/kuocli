/**
 * Search whole substring in a string.
 * @param str String to search in.
 * @param subStr Substring to search.
 * @returns True if the whole substring exists in the string. False otherwise.
 *
 * @example
 * ```ts
 * stringContains('a','b'); // false
 * stringContains('aa','a'); // false
 * stringContains('a a','a'); // true
 * ```
 */
export function stringContains(str: string, subStr: string): boolean {
  return RegExp(`\\b${subStr}\\b`).test(str);
}