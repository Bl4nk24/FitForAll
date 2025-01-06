<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark bg-dark"
    role="navigation"
    aria-label="Hauptnavigation"
  >
    <div class="container-fluid">
      <a class="navbar-brand" href="#" @click.prevent="goHome">
        FitforAll
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Navigationsmenü umschalten"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto" role="menubar">
          <!-- Link zu den Workouts -->
          <li class="nav-item" role="none">
            <router-link
              to="/workouts"
              class="nav-link"
              role="menuitem"
              >Workouts</router-link
            >
          </li>
          <!-- Link zum Profil (falls eingeloggt) -->
          <li class="nav-item" role="none" v-if="userEmail">
            <router-link
              to="/profile"
              class="nav-link"
              role="menuitem"
              >Profil</router-link
            >
          </li>
          <!-- Link zur Startseite (falls eingeloggt) -->
          <li class="nav-item" role="none" v-if="userEmail">
            <router-link
              to="/"
              class="nav-link"
              role="menuitem"
              >Home</router-link
            >
          </li>

          <!-- Login/Logout -->
          <li class="nav-item" role="none">
            <button
              v-if="!userEmail"
              class="btn btn-outline-light ms-2"
              role="menuitem"
              @click="goLogin"
            >
              Login
            </button>
            <button
              v-else
              class="btn btn-outline-danger ms-2"
              role="menuitem"
              @click="logout"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

// Aktueller User
const userEmail = ref(null)

// Router zur Navigation
const router = useRouter()

const getUser = async () => {
  const { data } = await supabase.auth.getUser()
  userEmail.value = data?.user?.email || null
}

onMounted(() => {
  getUser()
})

// Navigation
const goHome = () => {
  router.push('/')
}

const goLogin = () => {
  router.push('/auth')
}

const goProfile = () => {
  router.push('/profile')
}

// Logout
const logout = async () => {
  await supabase.auth.signOut()
  userEmail.value = null
  router.push('/auth')
}
</script>

<style scoped>
.navbar-brand {
  cursor: pointer;
}
</style>
