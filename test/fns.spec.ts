import { describe, it, expect } from 'vitest'
import { pattern, escapeRegex } from '../src/fns'

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    const specialChars = [
      { input: '[', expected: '\\[' },
      { input: ']', expected: '\\]' },
      { input: '(', expected: '\\(' },
      { input: ')', expected: '\\)' },
      { input: '{', expected: '\\{' },
      { input: '}', expected: '\\}' },
      { input: '*', expected: '\\*' },
      { input: '+', expected: '\\+' },
      { input: '?', expected: '\\?' },
      { input: '.', expected: '\\.' },
      { input: '^', expected: '\\^' },
      { input: '$', expected: '\\$' },
      { input: '|', expected: '\\|' },
      { input: '\\', expected: '\\\\' },
      { input: '/', expected: '\\/' },
      { input: '-', expected: '\\-' },
    ]

    specialChars.forEach(({ input, expected }) => {
      expect(escapeRegex(input)).toBe(expected)
    })
  })

  it('should handle multiple special characters', () => {
    expect(escapeRegex('(hello)*')).toBe('\\(hello\\)\\*')
    expect(escapeRegex('[test]+')).toBe('\\[test\\]\\+')
    expect(escapeRegex('$.^')).toBe('\\$\\.\\^')
  })

  it('should not modify normal characters', () => {
    expect(escapeRegex('hello')).toBe('hello')
    expect(escapeRegex('world123')).toBe('world123')
    expect(escapeRegex('abc')).toBe('abc')
  })

  it('should handle empty string', () => {
    expect(escapeRegex('')).toBe('')
  })

  it('should handle mixed special and normal characters', () => {
    expect(escapeRegex('hello(world)')).toBe('hello\\(world\\)')
    expect(escapeRegex('test.com')).toBe('test\\.com')
    expect(escapeRegex('$price*2')).toBe('\\$price\\*2')
  })

  it('should handle repeated special characters', () => {
    expect(escapeRegex('...')).toBe('\\.\\.\\.')
    expect(escapeRegex('***')).toBe('\\*\\*\\*')
    expect(escapeRegex('$$$')).toBe('\\$\\$\\$')
  })
})

describe('pattern word boundaries', () => {
  it('should match empty string', () => {
    const text = ' word '
    const regex = new RegExp(pattern(' ', true), 'g')
    const matches = text.match(regex)
    
    expect(matches).toEqual([' ', ' '])
  })

  it('should match word start when set to "start"', () => {
    const text = 'test testing tested contest'
    const regex = new RegExp(pattern('test', 'start'), 'g')
    const matches = text.match(regex)
    expect(matches).toEqual(['testing', 'tested'])
  })

  it('should match word end when set to "end"', () => {
    const text = 'test contest retest'
    const regex = new RegExp(pattern('test', 'end'), 'g')
    const matches = text.match(regex)
    expect(matches).toEqual(['contest', 'retest'])
  })

  it('should match exact word when boundary is true', () => {
    const text = 'test testing tested contest retest'
    const regex = new RegExp(pattern('test', true), 'g')
    const matches = text.match(regex)
    expect(matches).toEqual(['test'])
  })

  it('should match anywhere when boundary is false', () => {
    const text = 'test testing tested contest retest'
    const regex = new RegExp(pattern('test', false), 'g')
    const matches = text.match(regex)
    expect(matches).toEqual(['test', 'test', 'test', 'test', 'test'])
  })

  it('should handle numbers in words', () => {
    const text = 'test123 test123ing test123ed'
    const regex = new RegExp(pattern('test123', 'start'), 'g')
    const matches = text.match(regex)
    
    expect(matches).toEqual(['test123ing', 'test123ed'])
  })

  it('should handle multiple word matches', () => {
    const text = 'pretest test posttest testing tested'
    const regex = new RegExp(pattern('test', 'end'), 'g')
    const matches = text.match(regex)
    expect(matches).toEqual(['pretest', 'posttest'])
  })

  it('should handle word boundaries with punctuation', () => {
    const text = 'test, testing. tested! (test)'
    const regex = new RegExp(pattern('test', 'end'), 'g')
    const matches = text.match(regex)

    expect(matches).toEqual(null)
  })
})
