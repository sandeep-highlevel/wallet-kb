import { ref } from 'vue'

const KEY = 'wallet-kb-theme'
const isDark = ref(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))

/** Light/dark toggle. The choice is a per-viewer convenience; storage failures fall back silently to the class. */
export function useTheme() {
  function setDark(dark: boolean) {
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light')
    } catch (err: unknown) {
      // Private mode or blocked storage: the theme still applies for this visit.
      void err
    }
  }
  return { isDark, toggle: () => setDark(!isDark.value), setDark }
}
