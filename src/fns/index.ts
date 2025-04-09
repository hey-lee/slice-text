
export const pattern = (
    word: string,
    boundary: boolean | `start` | `end`,
) => {
    if (word.trim() === '' || boundary === false) return word
    if (boundary === `start`) return `\\b${word}\\w+`
    if (boundary === `end`) return `\\w+${word}\\b`
    if (boundary === true) return `\\b${word}\\b`
    return word
}