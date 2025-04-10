
/**
 * Escapes special regex characters in a string
 * @param string - The input string to escape regex characters from
 * @returns The string with escaped regex special characters
 */
export const escapeRegex = (string: string) => {
  return string.replace(/[\(\)\[\]\{\}\/\*\+\?\.\\\^\$\|\-]/g, `\\$&`)
}

/**
 * Creates a regex pattern with optional word boundaries
 * @param word - The word to create a pattern from
 * @param boundary - Controls word boundary behavior:
 *  - true: adds boundaries on both sides
 *  - 'start': adds boundary at start only
 *  - 'end': adds boundary at end only
 *  - false: no boundaries
 * @returns The regex pattern string with specified boundaries
 */
export const pattern = (word: string, boundary: boolean | `start` | `end`) => {
  if (word.trim() === '' || boundary === false) return word
  if (boundary === `start`) return `\\b${word}\\w+`
  if (boundary === `end`) return `\\w+${word}\\b`
  if (boundary === true) return `\\b${word}\\b`
  return word
}
