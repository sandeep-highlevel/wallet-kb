import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import WalletKb from '../src/WalletKb.vue'

const TABS = ['overview', 'flows', 'charges', 'surfaces', 'collections', 'controls', 'data', 'sdk', 'references']

async function render(query: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: WalletKb }] })
  await router.push(`/?${query}`)
  const wrapper = mount(WalletKb, { global: { plugins: [router], stubs: { transition: false } }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('WalletKb', () => {
  it.each(TABS)('renders the %s tab without errors', async (tab) => {
    const wrapper = await render(`tab=${tab}`)
    expect(wrapper.find('main').text().length).toBeGreaterThan(50)
    expect(wrapper.find('[aria-current="page"]').attributes('data-tab')).toBe(tab)
    wrapper.unmount()
  })

  it('falls back to the overview for an unknown tab', async () => {
    const wrapper = await render('tab=nope')
    expect(wrapper.find('[aria-current="page"]').attributes('data-tab')).toBe('overview')
    wrapper.unmount()
  })

  it('opens the search palette with Cmd+K', async () => {
    const wrapper = await render('tab=overview')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    await flushPromises()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    wrapper.unmount()
  })
})
