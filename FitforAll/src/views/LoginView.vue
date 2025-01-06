<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="text-center mb-4">Einloggen</h2>
        <form @submit.prevent="signIn">
          <div class="mb-3">
            <label for="email" class="form-label">E-Mail</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="email"
              required
              aria-required="true"
              aria-label="E-Mail-Adresse eingeben"
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Passwort</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              required
              aria-required="true"
              aria-label="Passwort eingeben"
            />
          </div>
          <button type="submit" class="btn btn-primary w-100">Einloggen</button>
        </form>

        <div class="mt-3" v-if="errorMessage">
          <div class="alert alert-danger">{{ errorMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()

const signIn = async () => {
  errorMessage.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    errorMessage.value = error.message
  } else {
    // Weiterleitung zur Startseite
    router.push('/')
  }
}
</script>

<style scoped>
.container {
  margin-top: 70px;
}
</style>
