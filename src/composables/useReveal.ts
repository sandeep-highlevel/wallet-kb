import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { prefersReducedMotion } from './motion'

/** Cards and panels that fade up as they scroll into view. Nested matches animate with their parent. */
export const REVEAL_SELECTOR = '.rounded-2xl, .rounded-xl, section > h2, [data-reveal-me]'
const STEP_MS = 45
const MAX_DELAY_MS = 360
const SETTLE_MS = 900

/** Returns the outermost reveal targets inside root that have not been revealed yet. */
export function revealTargets(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)].filter((el) => {
    if (el.dataset.reveal) return false
    const outer = el.parentElement?.closest(REVEAL_SELECTOR)
    return !outer || !root.contains(outer)
  })
}

export function useReveal(root: Ref<HTMLElement | null>) {
  let io: IntersectionObserver | null = null
  let mo: MutationObserver | null = null
  let pending = 0

  function settle(el: HTMLElement) {
    // Drop the reveal styles so component transitions (hover lifts) take over again.
    setTimeout(() => (el.dataset.reveal = 'done'), SETTLE_MS)
  }

  function scan() {
    const el = root.value
    if (!el || !io) return
    for (const t of revealTargets(el)) {
      t.dataset.reveal = 'wait'
      io.observe(t)
    }
  }

  onMounted(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        visible.forEach((e, i) => {
          const t = e.target as HTMLElement
          t.style.setProperty('--reveal-delay', `${Math.min(i * STEP_MS, MAX_DELAY_MS)}ms`)
          t.dataset.reveal = 'in'
          io?.unobserve(t)
          settle(t)
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    )
    mo = new MutationObserver(() => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(scan)
    })
    if (root.value) mo.observe(root.value, { childList: true, subtree: true })
    scan()
  })
  onBeforeUnmount(() => {
    io?.disconnect()
    mo?.disconnect()
    cancelAnimationFrame(pending)
  })
  return { scan }
}
