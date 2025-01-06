import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase'
import HomeView from './views/HomeView.vue'
import ProfileView from './views/ProfileView.vue'
import AuthView from './views/AuthView.vue'
import OnboardingView from './views/OnboardingView.vue'

const routes = [
  { path: '/auth', component: AuthView },
  { path: '/onboarding', component: OnboardingView },
  { path: '/', component: HomeView, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// router.js (Ausschnitt)
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const { data } = await supabase.auth.getUser()
    if (!data?.user) {
      return '/auth'
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('has_finished_onboarding')
      .eq('id', data.user.id)
      .single()
    if (profileData && !profileData.has_finished_onboarding && to.path !== '/onboarding') {
      return '/onboarding'
    }
  }
})


export default router
