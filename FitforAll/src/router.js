import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase'

// Views
import HomeView from './views/HomeView.vue'
import AuthView from './views/AuthView.vue'

const routes = [
  { path: '/auth', name: 'Auth', component: AuthView },
  { path: '/', name: 'Home', component: HomeView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard für die Home-Route
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      return '/auth'
    }
  }
})

export default router
