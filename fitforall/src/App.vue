<template>
  <div>
    <Navbar />

    <div class="container mt-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
export default {
  components: {
    Navbar
  }
}
</script>

<style>
/* Optional: globale Styles */
</style>
