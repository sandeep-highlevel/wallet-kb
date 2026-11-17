import { describe, expect, it } from 'vitest'
import { revealTargets } from '../src/composables/useReveal'

describe('revealTargets', () => {
  it('returns only outermost cards that are not revealed yet', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div class="rounded-2xl" id="a"><div class="rounded-xl" id="nested"></div></div>
      <div class="rounded-xl" id="b"></div>
      <div class="rounded-xl" id="done" data-reveal="done"></div>`
    expect(revealTargets(root).map((e) => e.id)).toEqual(['a', 'b'])
  })
})
