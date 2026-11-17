import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { easeOutCubic, prefersReducedMotion } from './motion'

/** Animates 0 → target once on mount. Shows the final value at once under reduced motion. */
export function useCountUp(target: number, ms = 1400, delay = 0): Ref<number> {
  const value = ref(prefersReducedMotion() ? target : 0)
  let raf = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      value.value = target
      return
    }
    timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = (now - start) / ms
        value.value = Math.round(target * easeOutCubic(t))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    if (timer) clearTimeout(timer)
  })
  return value
}
