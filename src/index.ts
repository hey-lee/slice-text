
import { pattern, escapeRegex } from './fns'

/**
 * Interface representing a slice of text with start and end positions.
 * Optionally includes a matched flag to indicate if this slice matches search criteria.
 * 
 * @interface
 * @property {number} start - The starting index of the slice
 * @property {number} end - The ending index of the slice
 * @property {boolean} [matched] - Optional flag indicating if this slice matches search criteria
 * 
 */
export interface Slice {
  start: number
  end: number
  matched?: boolean
}

/**
 * Function type that takes a word string and returns a RegExp for matching.
 * Used to customize how words are matched in the text.
 * 
 * @param {string} word - The word to create a RegExp pattern for
 * @returns {RegExp} A regular expression for matching the word
 * 
 * @example
 * const match: Match = (word) => new RegExp(word, 'gi');
 * const pattern = match('hello');
 * // Returns: /hello/gi
 */

type Match = (word: string) => RegExp

/**
 * Interface for configuring text slicing options.
 * 
 * @interface
 * @property {(boolean | 'start' | 'end')} [boundary] - Controls word boundary matching:
 *   - `true`: Match whole words with boundaries on both sides
 *   - `'start'`: Match words with boundary at start
 *   - `'end'`: Match words with boundary at end
 *   - `false` or `undefined`: No word boundary matching
 * @property {boolean} [caseSensitive] - Controls case sensitivity of matching:
 *   - `true`: Matches are case-sensitive
 *   - `false` or `undefined`: Matches are case-insensitive
 * @property {boolean} [escape] - Controls if the search words should be escaped for use in a regular expression:
 *   - `true`: Escape the search words
 *   - `false` or `undefined`: Do not escape the search words
 */
interface Options {
  escape?: boolean
  boundary?: boolean | 'start' | 'end'
  caseSensitive?: boolean
}

/**
 * Type representing either configuration options for text slicing or a custom match function.
 * Can be either an Options object with boundary and case sensitivity settings,
 * or a Match function that returns a RegExp for custom word matching.
 * 
 * @typedef {Options | Match} OptionsOrMatch
 */
type OptionsOrMatch = Options | Match
/**
 * Type definition for a text slicing function that finds matches for search words in text.
 * 
 * @param {string} text - The input text to search within
 * @param {string[]} searchWords - Array of words to search for
 * @param {OptionsOrMatch} [options] - Optional configuration or match function:
 *   - If object: Configuration with the following options:
 *     - `escape`: Controls whether to escape special regex characters in search words
 *     - `boundary`: Controls word boundary matching (true/false/'start'/'end')
 *     - `caseSensitive`: Controls case sensitivity of matching
 *   - If function: Custom matching function that returns a RegExp
 * @returns {Slice[]} Array of slices representing matched positions in the text
 */
export type Slicing = (text: string, searchWords: string[], options?: OptionsOrMatch) => Slice[]

/**
 * Creates slices of text based on search words.
 * 
 * @param {string} text - The input text to search within
 * @param {string[]} searchWords - Array of words to search for
 * @param {OptionsOrMatch} [options] - Optional configuration or match function:
 *   - If object: Configuration with the following options:
 *     - `escape` (boolean): When true, escapes special regex characters in search words, default is `true`.
 *     - `boundary` (boolean | 'start' | 'end'): Controls word boundary matching, default is `true`.
 *       - `true`: Matches whole words with boundaries on both sides
 *       - `'start'`: Matches words with boundary at start
 *       - `'end'`: Matches words with boundary at end
 *       - `false`: No word boundary matching
 *     - `caseSensitive` (boolean): When true, matches are case-sensitive
 *   - If function: Custom matching function that returns a RegExp
 * @returns {Slice[]} Array of slices representing matched positions
 * 
 * @example
 * // Basic usage with default options (special characters escapes, word boundaries, case-insensitive)
 * const text = "Hello world, hello there *";
 * const words = ["hello", "world", "*"];
 * const result = slicing(text, words);
 * // Result: [
 * //   { start: 0, end: 5 },    // "Hello"
 * //   { start: 6, end: 11 },   // "world"
 * //   { start: 13, end: 18 }   // "hello"
 * // ]
 * 
 * @example
 * // Using escape option for special characters
 * const text = "*function(x) { return x; }";
 * const words = ["*function(x)"];
 * const result = slicing(text, words, { 
 *   escape: true,
 * });
 * // Result: [{ start: 0, end: 12 }]
 * @example
 * // Custom case-sensitive matching
 * const text = "HELLO hello World";
 * const searchWords = ["hello"];
 * const match = (word) => new RegExp(word, "g");
 * const result = slicing(text, searchWords, match);
 * // Returns: [
 * //   { start: 6, end: 11 }    // Only matches lowercase "hello"
 * // ]
 */
export const slicing: Slicing = (
  text,
  searchWords,
  options = {
    escape: true,
    boundary: true,
    caseSensitive: false,
  },
) => {
  let match: Match = (word: string) => new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')
  if (typeof options === 'function') {
    match = options
  } else {
    match = (word) => {
      word = options.escape ? escapeRegex(word) : word
      word = options.boundary ? pattern(word, options.boundary) : word
      return new RegExp(word, options.caseSensitive ? 'g' : 'gi')
    }
  }
  return Array.from(new Set(searchWords))
    .filter(word => !!word)
    .map((word) => word)
    .reduce((slices, word) => {
      let matched: RegExpExecArray | null
      const regex = match(word)

      while (matched = regex.exec(text)) {
        const start = matched.index
        const end = regex.lastIndex

        if (end > start) {
          slices.push({
            start,
            end,
          })
        }
 
        // FIXED: special regex characters in search words can cause infinite loop if `options.escape` is `false`
        if (start === end) {
          regex.lastIndex++
        }
      }

      return slices
    }, [] as Slice[])
}

/**
 * Merges overlapping slices into a single slice.
 * 
 * @param {Slice[]} slices - Array of slices to merge
 * @returns {Slice[]} Array of merged slices with no overlaps
 * 
 * @example
 * // Merge overlapping slices
 * const slices = [
 *   { start: 0, end: 5 },
 *   { start: 3, end: 8 },
 *   { start: 10, end: 15 }
 * ];
 * const merged = mergeOverlap(slices);
 * // Returns: [
 * //   { start: 0, end: 8 },
 * //   { start: 10, end: 15 }
 * // ]
 * 
 * @example
 * // No overlapping slices remain unchanged
 * const slices = [
 *   { start: 0, end: 5 },
 *   { start: 6, end: 10 }
 * ];
 * const merged = mergeOverlap(slices);
 * // Returns: [
 * //   { start: 0, end: 5 },
 * //   { start: 6, end: 10 }
 * // ]
 */
export const mergeOverlap = (slices: Slice[]) => {
  if (slices.length === 0) return slices
  const sortedSlices = slices.toSorted((a, b) => a.start - b.start)
  const merged: Slice[] = []
  let [current]: Slice[] = sortedSlices

  for (let i = 1; i < sortedSlices.length; i++) {
    const next = sortedSlices[i]

    if (current && next) {
      if (next.start <= current.end) {
        current = {
          start: current.start,
          end: Math.max(current.end, next.end),
        }
      } else {
        merged.push(current)
        current = { ...next }
      }
    }
  }

  if (current) merged.push(current)

  return merged
}


/**
 * Updates slices with matched status and fills gaps between matched slices.
 * 
 * @param {Slice[]} slices - Array of slices to update with matched status
 * @param {number} [textLength=0] - Total length of the text being processed
 * @returns {Slice[]} Array of slices with matched status and filled gaps
 * 
 * @example
 * // Basic usage with matched slices
 * const slices = [
 *   { start: 5, end: 10 },
 *   { start: 15, end: 20 }
 * ];
 * const result = fillSliceGaps(slices, 25);
 * // Returns: [
 * //   { start: 0, end: 5, matched: false },    // Gap at start
 * //   { start: 5, end: 10, matched: true },    // First match
 * //   { start: 10, end: 15, matched: false },  // Gap between matches
 * //   { start: 15, end: 20, matched: true },   // Second match
 * //   { start: 20, end: 25, matched: false }   // Gap at end
 * // ]
 * 
 * @example
 * // Empty slices array
 * const result = fillSliceGaps([], 10);
 * // Returns: [
 * //   { start: 0, end: 10, matched: false }    // Entire text marked as unmatched
 * // ]
 */
export const fillSliceGaps = (slices: Slice[],
  textLength: number = 0,
) => {
  if (textLength === 0) return []

  const matchedSlices: Slice[] = []
  const push = (start: number, end: number, matched: boolean) => {
    if (end - start > 0) {
      matchedSlices.push({
        start,
        end,
        matched
      })
    }
  }

  if (slices.length === 0) {
    push(0, textLength, false)
  } else {
    let startIndex = 0
    slices.forEach((slice) => {
      // fill gaps and set matched to false
      push(startIndex, slice.start, false)
      // set matched to true
      push(slice.start, slice.end, true)
      startIndex = slice.end
    })
    push(startIndex, textLength, false)
  }

  return matchedSlices
}


/**
 * Processes text to find matches for search words and returns an array of slices with matched status.
 * This function implements the {@link Slicing} interface, combining slicing, overlap merging, and gap filling operations.
 * 
 * @param {string} text - The input text to search within
 * @param {string[]} searchWords - Array of words to search for
 * @param {OptionsOrMatch} [options] - Optional configuration or custom matching function:
 *   - If object: Configuration with the following options:
 *     - `boundary`: Controls word boundary matching (`boolean`, `'start'`, or `'end'`)
 *     - `caseSensitive`: Controls case sensitivity of the search (`boolean`)
 *   - If function: Custom matching function that takes a word and returns a RegExp
 * @returns {Slice[]} Array of slices representing matched positions in the text, with gaps filled and overlaps merged
 * 
 * @example
 * // Basic usage with multiple search words
 * const text = "Hello world, how are you?";
 * const searchWords = ["hello", "you"];
 * const result = sliceText(text, searchWords);
 * // Returns: [
 * //   { start: 0, end: 5, matched: true },     // "Hello"
 * //   { start: 5, end: 21, matched: false },   // " world, how are "
 * //   { start: 21, end: 24, matched: true },   // "you"
 * //   { start: 24, end: 23, matched: false }   // "?"
 * // ]
 * 
 * @example
 * // Custom case-sensitive matching
 * const text = "HELLO hello WORLD";
 * const searchWords = ["hello"];
 * const match = (word) => new RegExp(word, "g");
 * const result = sliceText(text, searchWords, match);
 * // Returns: [
 * //   { start: 0, end: 6, matched: false },    // "HELLO "
 * //   { start: 6, end: 11, matched: true },    // "hello"
 * //   { start: 11, end: 17, matched: false }   // " WORLD"
 * // ]
 */
export const sliceText: Slicing = (text, searchWords, options) => {
  return fillSliceGaps(mergeOverlap(slicing(text, searchWords, options)), text.length)
}
