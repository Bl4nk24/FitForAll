<template>
    <div class="row justify-content-center">
      <div class="col-md-6 text-center">
        <h2>Willkommen, {{ userEmail }}</h2>
        <button class="btn btn-danger mt-3" @click="handleLogout">
          Logout
        </button>
  
        <div class="alert alert-info mt-3" v-if="message">
          {{ message }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { supabase } from '../supabase'
  
  export default {
    data() {
      return {
        userEmail: '',
        message: ''
      }
    },
    async mounted() {
      // Prüfen, ob User eingeloggt ist
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        this.$router.push('/login')
      } else {
        this.userEmail = data.user.email
      }
    },
    methods: {
      async handleLogout() {
        await supabase.auth.signOut()
        this.message = 'Du hast dich erfolgreich ausgeloggt.'
        // Optional: Weiterleitung zurück zum Login
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      }
    }
  }
  </script>
  
  <style scoped>
  </style>
  