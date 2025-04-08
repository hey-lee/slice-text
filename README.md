
A utility for slicing text based on search words, with support for overlapping matches and customizable matching patterns.

## Features

- 🎯 Precise text slicing based on search words
- 🔄 Handles overlapping matches
- ⚡️ Customizable matching patterns
- 🎨 Case-sensitive/insensitive matching
- 📝 Clean and typed API (written in TypeScript)

## Installation

```bash
yarn add slice-text
npm i slice-text
pnpm i slice-text
```
## Usage

### Basic Usage

```js
import { sliceText } from 'slice-text'

const text = 'Hello hello world! How are you?'
const words = ['Hello', 'you']
const slices = sliceText(text, words) // Default matching pattern (case-insensitive)

console.log(slices)
// Output:
// [
//   { start: 0, end: 5, matched: true }, // 'Hello'
//   { start: 5, end: 6, matched: false }, // ' '
//   { start: 6, end: 11, matched: true }, // 'hello'
//   { start: 11, end: 27, matched: false }, // ' world! How are '
//   { start: 27, end: 30, matched: true }, // 'you'
//   { start: 30, end: 31, matched: false }, // '?'
// ]
```

### Custom Matching Pattern

```js
const text = 'HELLO Hello hello!'
const words = ['hello']
const match = (word: string) => new RegExp(word, 'g') // Case-sensitive matching
const result = sliceText(text, words, match)

console.log(result)
// Output:
// [
//   { start: 0, end: 12, matched: false }, // 'HELLO Hello 
//   { start: 12, end: 17, matched: true }, // 'hello'
//   { start: 17, end: 18, matched: false } // '!'
// ]
```

### Building a Marked Output

```js
const text = 'Hello world! How are you?'
const words = ['Hello', 'you']
const result = sliceText(text, words)
const markedText = slices.map(({ start, end, matched }) => {
  const segment = text.slice(start, end)
  return matched ? `<mark>${segment}</mark>` : segment
}).join('')
console.log(markedText)
// Output:
// '<mark>Hello</mark> <mark>world</mark>! How are you?'
```

## API

### `sliceText`

Main function that combines all slicing operations.

|Parameter|Type|Required|Default|Description|
|:-:|:-:|:-:|:-:|:-:|
|`text`| `string` | ✅ |  | The input text to be sliced |
|`words`| `string[]` | ✅ |  | Array of words to search for |
|`match`| `Function` |  | `(word) => new RegExp(word, 'gi')` | Optional custom matching function |


#### Returns `Slice[]`

```ts
interface Slice {
  start: number
  end: number
  matched?: boolean
}
```

## License

MIT © [Lee](https://github.com/hey-lee)