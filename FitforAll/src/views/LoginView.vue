<template>
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">E-Mail</label>
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
  </template>
  
  <script>
  import { supabase } from '../supabase'
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        errorMessage: '',
      }
    },
    methods: {
      async handleLogin() {
        this.errorMessage = ''
        try {
          const { user, error } = await supabase.auth.signIn({
            email: this.email,
            password: this.password
          })
          if (error) throw error
          // Weiterleitung zum Profil
          this.$router.push('/profile')
        } catch (err) {
          this.errorMessage = err.message
        }
      }
    }
  }
  </script>
  
  <style scoped>
  /* Optionale Styles */
  </style>
  