import type { Directive } from 'vue'
import { gsap } from './gsap'
import { prefersReducedMotion } from './motion'

type MagneticEl = HTMLElement & { __magnetic?: () => void }

/** v-magnetic: the element leans toward the pointer and springs back on leave. */
export const vMagnetic: Directive<MagneticEl, number | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion()) return
    const strength = binding.value ?? 0.3
    const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      toX((e.clientX - (r.left + r.width / 2)) * strength)
      toY((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.__magnetic = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.killTweensOf(el)
    }
  },
  unmounted(el) {
    el.__magnetic?.()
  }
}
