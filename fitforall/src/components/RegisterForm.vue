<template>
    <form @submit.prevent="handleSignUp" class="register-form">
      <label>
        E-Mail
        <input type="email" v-model="email" required />
      </label>
      <label>
        Passwort
        <input type="password" v-model="password" required />
      </label>
      <button type="submit">Registrieren</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  
  const { signUpWithEmail } = useAuth()
  
  const email = ref('')
  const password = ref('')
  const errorMessage = ref(null)
  
  async function handleSignUp() {
    errorMessage.value = null
    if (!email.value || !password.value) {
      errorMessage.value = 'Bitte E-Mail und Passwort eingeben.'
      return
    }
  
    const result = await signUpWithEmail(email.value, password.value)
    if (!result) {
      errorMessage.value = 'Registrierung fehlgeschlagen.'
    }
  }
  </script>
  
  <style scoped>
  .register-form {
    max-width: 300px;
    display: flex;
    flex-direction: column;
  }
  .error {
    color: red;
    margin-top: 0.5rem;
  }
  </style>
  