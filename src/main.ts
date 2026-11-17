import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import WalletKb from './WalletKb.vue'
import './style.css'

// Hash history: GitHub Pages has no SPA fallback, so deep links live after "#".
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: WalletKb },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

createApp(App).use(router).mount('#app')
