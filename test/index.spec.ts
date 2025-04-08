import { describe, it, expect } from 'vitest'
import {
  slicing,
  mergeOverlap,
  fillSliceGaps,
  sliceText,
} from '../src'

describe('slicing', () => {
  it('should return empty array for empty text', () => {
    const text = ''
    const words = ['hello']
    const result = slicing(text, words)
    expect(result).toEqual([])
  })

  it('should return empty array for empty words', () => {
    const text = 'Hello world'
    const words = []
    const result = slicing(text, words)
    expect(result).toEqual([])
  })

  it('should return empty array for empty text and empty words', () => {
    const text = ''
    const words = []
    const result = slicing(text, words)
    expect(result).toEqual([])
  })

  it('should find matches for a single word', () => {
    const text = 'Hello world'
    const words = ['Hello']
    const result = slicing(text, words)
    expect(result).toEqual([{ start: 0, end: 5 }])
  })

  it('should find matches for multiple words', () => {
    const text = 'Hello world, hello universe'
    const words = ['Hello', 'hello']
    const result = slicing(text, words)
    expect(result).toEqual([
      { start: 0, end: 5 },
      { start: 13, end: 18 },
      { start: 0, end: 5 },
      { start: 13, end: 18 },
    ])
  })

  it('should deduplicate words', () => {
    const text = 'hello hello hello'
    const words = ['hello', 'hello']
    const result = slicing(text, words)

    expect(result).toHaveLength(3)
  })

  it('should handle case-insensitive matching by default', () => {
    const text = 'Hello World'
    const words = ['hello', 'world']
    const result = slicing(text, words)

    expect(result).toEqual([
      { start: 0, end: 5 },
      { start: 6, end: 11 },
    ])
  })

  it('should handle case-sensitive matching', () => {
    const text = 'Hello World hello world'
    const words = ['hello', 'world']
    const match = (word: string) => new RegExp(word, 'g')
    const result = slicing(text, words, match)

    expect(result).toEqual([
      { start: 12, end: 17 },
      { start: 18, end: 23 },
    ])
  })

  it('should handle zero width characters', () => {
    const text = 'Hello\u200bworld' // Text with zero-width space
    const words = ['Hello', 'world']
    const result = slicing(text, words)
    expect(result).toEqual([
      { start: 0, end: 5 },
      { start: 6, end: 11 },
    ])
  })
})

describe('mergeOverlap', () => {
  it('should return empty array for empty input', () => {
    const slices = []
    const result = mergeOverlap(slices)
    expect(result).toEqual([])
  })

  it('should merge adjacent slices', () => {
    const slices = [
      { start: 0, end: 5 },
      { start: 5, end: 10 },
    ]
    const result = mergeOverlap(slices)
    expect(result).toEqual([{ start: 0, end: 10 }])
  })

  it('should merge overlapping slices', () => {
    const slices = [
      { start: 0, end: 5 },
      { start: 3, end: 8 },
    ]
    const result = mergeOverlap(slices)
    expect(result).toEqual([{ start: 0, end: 8 }])
  })

  it('should not merge non-overlapping slices', () => {
    const slices = [
      { start: 0, end: 5 },
      { start: 10, end: 15 },
    ]
    const result = mergeOverlap(slices)
    expect(result).toEqual([
      { start: 0, end: 5 },
      { start: 10, end: 15 },
    ])
  })
})

describe('fillSliceGaps', () => {
  it('should handle empty slices', () => {
    const result = fillSliceGaps([], 10)

    expect(result).toEqual([{ start: 0, end: 10, matched: false }])
  })

  it('should mark matched and unmatched regions', () => {
    const slices = [
      { start: 0, end: 5 },
      { start: 10, end: 15 },
    ]
    const textLength = 20
    const result = fillSliceGaps(slices, textLength)

    expect(result).toEqual([
      { start: 0, end: 5, matched: true },
      { start: 5, end: 10, matched: false },
      { start: 10, end: 15, matched: true },
      { start: 15, end: 20, matched: false },
    ])
  })

  it('should handle slices that cover the entire text', () => {
    const slices = [{ start: 0, end: 10 }]
    const textLength = 10
    const result = fillSliceGaps(slices, textLength)

    expect(result).toEqual([{ start: 0, end: 10, matched: true }])
  })

  it('should handle zero text length', () => {
    const slices = [{ start: 0, end: 5 }]
    const result = fillSliceGaps(slices, 0)

    expect(result).toEqual([])
  })

  it('should not create zero-length slices', () => {
    const slices = [
      { start: 0, end: 5 },
      { start: 5, end: 10 },
    ]
    const result = fillSliceGaps(slices, 10)

    expect(result).toEqual([
      { start: 0, end: 5, matched: true },
      { start: 5, end: 10, matched: true },
    ])
  })
})

describe('sliceText', () => {
  it('should handle empty text', () => {
    const text = ''
    const words = ['hello']
    const result = sliceText(text, words)

    expect(result).toEqual([])
  })

  it('should handle empty words', () => {
    const text = 'Hello world'
    const words = []
    const result = sliceText(text, words)

    expect(result).toEqual([{ start: 0, end: 11, matched: false }])
  })

  it('should handle empty text and empty words', () => {
    const text = ''
    const words = []
    const result = sliceText(text, words)

    expect(result).toEqual([])
  })

  it('should find matches and update matched regions', () => {
    const text = 'Hello world, hello universe'
    const words = ['Hello', 'hello']
    const result = sliceText(text, words)

    expect(result).toEqual([
      { start: 0, end: 5, matched: true },
      { start: 5, end: 13, matched: false },
      { start: 13, end: 18, matched: true },
      { start: 18, end: 27, matched: false },
    ])
  })

  it('should handle case-sensitive matching', () => {
    const text = 'Hello World'
    const words = ['Hello', 'hello']
    const match = (word: string) => new RegExp(word, 'g')
    const result = sliceText(text, words, match)

    expect(result).toEqual([
      { start: 0, end: 5, matched: true },
      { start: 5, end: 11, matched: false },
    ])
  })

  it('should handle case-insensitive matching', () => {
    const text = 'Hello World'
    const words = ['hello', 'world']
    const match = (word: string) => new RegExp(word, 'gi')
    const result = sliceText(text, words, match)

    expect(result).toEqual([
      { start: 0, end: 5, matched: true },
      { start: 5, end: 6, matched: false },
      { start: 6, end: 11, matched: true },
    ])
  })

  it('should handle overlapping matches in word boundary mode', () => {
    const text = 'aaaaa'
    const words = ['aa']
    const result = sliceText(text, words)

    expect(result).toEqual([
      { start: 0, end: 5, matched: false },
    ])
  })

  it('should handle overlapping matches in word boundary start', () => {
    const text = 'aaaaa'
    const words = ['aa']
    const result = sliceText(text, words, word => new RegExp(`\\b${word}`, 'g'))

    expect(result).toEqual([
      { start: 0, end: 2, matched: true },
      { start: 2, end: 5, matched: false },
    ])
  })

  it('should handle overlapping matches in word boundary end', () => {
    const text = 'aaaaa'
    const words = ['aa']
    const result = sliceText(text, words, word => new RegExp(`${word}\\b`, 'g'))

    expect(result).toEqual([
      { start: 0, end: 3, matched: false },
      { start: 3, end: 5, matched: true },
    ])
  })
})
