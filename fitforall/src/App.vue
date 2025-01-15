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
/* Globale Farbschema-Stile */
.theme-normal {
  background-color: white;
  color: black;
}

.theme-high-contrast {
  background-color: black;
  color: yellow;
}

.theme-dark {
  background-color: #121212;
  color: white;
}

/* Zusätzliche globale Styles, falls gewünscht */
</style>
