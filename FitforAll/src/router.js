import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './supabase';
import HomeView from './views/HomeView.vue';
import ProfileView from './views/ProfileView.vue';
import AuthView from './views/AuthView.vue';
import OnboardingView from './views/OnboardingView.vue';
import AddWorkoutView from './views/AddWorkoutView.vue';
import VideosPage from './views/VideosPage.vue';
import TrainingPlansOverview from './views/TrainingPlansOverview.vue';
import ErnaehrungsplanPage from './views/ErnaehrungsplanPage.vue';

const routes = [
  { path: '/auth', component: AuthView },
  { path: '/onboarding', component: OnboardingView },
  { path: '/', component: HomeView, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/upload', component: AddWorkoutView, meta: { requiresAuth: true } },
  { path: '/videos', component: VideosPage, meta: { requiresAuth: true } },
  { path: '/training-plans', component: TrainingPlansOverview, meta: { requiresAuth: true } },
  { path: '/ernaehrungsplan', component: ErnaehrungsplanPage, meta: { requiresAuth: true } },
  {
    path: '/workout/:id',
    name: 'ViewVideo',
    component: () => import('./views/ViewVideo.vue'),
  },
  {
    path: '/training-plans/:planId/detail',
    name: 'TrainingPlanDetail',
    component: () => import('./views/TrainingPlanDetail.vue'),
  },
  {
    path: '/training-plans/:planId/start',
    name: 'TrainingPlanStart',
    component: () => import('./views/TrainingPlanStart.vue'),
    props: true,
  },
  // Neue Route für die Community-Seite:
  {
    path: '/community',
    component: () => import('./views/Community.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentifizierungsprüfung
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      return '/auth';
    }
    const { data: profileData } = await supabase
      .from('user_settings')
      .select('has_finished_onboarding')
      .eq('user_id', data.user.id)
      .single();
    if (profileData && !profileData.has_finished_onboarding && to.path !== '/onboarding') {
      return '/onboarding';
    }
  }
});

export default router;
