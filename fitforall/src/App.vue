<template>
  <div id="app">
    <!-- Zeige Header / Status nur, wenn user gesetzt ist -->
    <header v-if="user">
      <p>Eingeloggt als: {{ user.email }}</p>
      <button @click="handleSignOut">Abmelden</button>
    </header>

    <!-- Hauptbereich: wenn user da -> Router-View (oder deine Inhalte), sonst Login/Register -->
    <main>
      <div v-if="user">
        <!-- Hier kannst du entweder direkt deinen Inhalt einbinden oder den <router-view> -->
        <router-view />
      </div>
      <div v-else>
        <h2>Bitte einloggen oder registrieren</h2>
        
        <!-- Login-Formular -->
        <LoginForm />

        <!-- Registrierungsformular -->
        <RegisterForm />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth.js'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'


// useAuth aus deinem Composable (siehe vorheriger Code)
const { user, loadUser, signOut } = useAuth()

// Beim Laden der App Nutzer laden, falls Session vorhanden ist
onMounted(() => {
  loadUser()
})

// Methode zum Abmelden
function handleSignOut() {
  signOut()
}
</script>

<style>
/* Optional: globale Styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 1rem;
}
</style>
