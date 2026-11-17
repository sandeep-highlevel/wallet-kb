import { describe, expect, it } from 'vitest'
import { easeOutCubic } from '../src/composables/motion'

describe('easeOutCubic', () => {
  it('starts at 0, ends at 1 and clamps outside the range', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(-1)).toBe(0)
    expect(easeOutCubic(2)).toBe(1)
  })
  it('moves fast early, slow late', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })
})
