<template>
  <form @submit.prevent="handleSignIn" class="login-form">
    <label>
      E-Mail
      <input type="email" v-model="email" required />
    </label>
    <label>
      Passwort
      <input type="password" v-model="password" required />
    </label>
    <button type="submit">Einloggen</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { signInWithEmail } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref(null)

async function handleSignIn() {
  errorMessage.value = null
  // Einfacher Check
  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte E-Mail und Passwort eingeben.'
    return
  }

  const result = await signInWithEmail(email.value, password.value)
  if (!result) {
    errorMessage.value = 'Login fehlgeschlagen. Bitte überprüfen.'
  }
}
</script>

<style scoped>
.login-form {
  max-width: 300px;
  display: flex;
  flex-direction: column;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
