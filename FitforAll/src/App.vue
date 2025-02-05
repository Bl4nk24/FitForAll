<template>
  <!-- Äußeres Wrapper-DIV, gesteuert vom Theme -->
  <div :class="themeClass">
    <!-- Navigation oben -->
    <NavigationBar @toggleTheme="changeTheme" />

    <!-- Hauptbereich für Router -->
    <main id="main-content" class="mt-4">
      <router-view />
    </main>

    <!-- ScreenReader-Button unten rechts -->
    <ScreenReaderButton />
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue';
import ScreenReaderButton from './views/ScreenReader.vue'; // Stelle sicher, dass der Pfad stimmt

export default {
  name: 'App',
  components: {
    NavigationBar,
    ScreenReaderButton,
  },
  computed: {
    themeClass() {
      // Liest die globale Klasse vom <body> aus – dadurch passt sich das Layout dem aktuell gesetzten Theme an
      return document.body.className;
    },
  },
  methods: {
    changeTheme(theme) {
      this.$toggleTheme(theme); // Ruft die globale Theme-Wechsel-Funktion auf
    },
  },
};
</script>

<style>
/* ========== Themestyles (kannst du 1:1 übernehmen) ========== */

/* Normal Theme */
.theme-normal {
  background-color: white;
  color: black;
}

.theme-normal .btn {
  background-color: #f8f9fa;
  color: black;
}

.theme-normal .card {
  background-color: white;
  color: black;
  border: 1px solid #ddd;
}

/* High Contrast Theme */
.theme-high-contrast {
  background-color: black;
  color: yellow;
}

.theme-high-contrast .btn {
  background-color: #444;
  color: yellow;
  border-color: yellow;
}

.theme-high-contrast .card {
  background-color: black;
  color: yellow;
  border: 2px solid yellow;
}

/* Dark Theme */
.theme-dark {
  background-color: #121212;
  color: white;
}

.theme-dark .btn {
  background-color: #333;
  color: white;
}

.theme-dark .card {
  background-color: #1e1e1e;
  color: white;
}

.s2 {
  fill: #e6e7e8;
  cursor: pointer;
  transition: fill 0.3s;
}

.s2:hover {
  fill: #007bff;
}

.s2.active {
  fill: #0056b3;
}

.s0 {
  fill: #808284;
}

.s1 {
  fill: #bbbdbf;
}
</style>
