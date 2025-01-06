<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="text-center">Einloggen</h2>
        <form @submit.prevent="signIn">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="email"
              required
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
            />
          </div>
          <button type="submit" class="btn btn-primary">Einloggen</button>
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

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const signIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    errorMessage.value = error.message
  } else {
    errorMessage.value = ''
    // Handle successful sign-in
  }
}
</script>

<style>
.container {
  margin-top: 50px;
}
</style>