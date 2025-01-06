import { createRouter, createWebHistory } from 'vue-router'

// Views
import LoginView from './views/LoginView.vue'
import SignupView from './views/SignupView.vue'
import ProfileView from './views/ProfileView.vue'

const routes = [
  { path: '/', redirect: '/login' }, // Weiterleitung zur Login-Seite
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/signup', name: 'Signup', component: SignupView },
  { path: '/profile', name: 'Profile', component: ProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
