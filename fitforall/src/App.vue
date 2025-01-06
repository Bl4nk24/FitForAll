<template>
  <div>
    <NavigationBar />

    <!-- Container für die aktive View -->
    <main id="main-content" class="mt-4">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'

export default {
  components: {
    NavigationBar,
  },
}
</script>

<style>
/* Globale Styles (falls gewünscht) */
</style>
