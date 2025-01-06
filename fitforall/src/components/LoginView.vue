<template>
    <div class="login-view">
      <h1>Login</h1>
      <form @submit.prevent="handleSignIn">
        <label for="email">E-Mail</label>
        <input type="email" id="email" v-model="email" required />
  
        <label for="password">Passwort</label>
        <input type="password" id="password" v-model="password" required />
  
        <button type="submit">Einloggen</button>
      </form>
  
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <div v-if="authUser">Eingeloggt als: {{ authUser.email }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  
  // Composable holen
  const { user, signInWithEmail } = useAuth()
  
  // Lokale Refs
  const email = ref('')
  const password = ref('')
  const errorMessage = ref(null)
  
  // Wenn bereits eingeloggter Nutzer vorhanden, kann man das abfangen
  const authUser = user
  
  async function handleSignIn() {
    errorMessage.value = null
    if (!email.value || !password.value) {
      errorMessage.value = 'Bitte E-Mail und Passwort eingeben.'
      return
    }
    const result = await signInWithEmail(email.value, password.value)
    if (!result) {
      errorMessage.value = 'Login fehlgeschlagen. Bitte Daten überprüfen.'
    }
  }
  </script>
  
  <style scoped>
  .login-view {
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
  </style>
  