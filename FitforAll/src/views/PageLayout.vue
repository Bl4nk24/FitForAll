<template>
  <div class="page">
    <div class="full-background">
      <!-- Header -->
      <section class="header py-5" :class="headerClass">
        <div class="container">
          <h1 class="display-4 fw-bold">{{ pageTitle }}</h1>
          <p class="lead">{{ pageSubtitle }}</p>
        </div>
      </section>

      <!-- Kleiner Trenner (optional) -->
      <div class="separator"></div>

      <!-- Haupt-Content -->
      <section class="container py-5">
        <slot></slot>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * Beispiel: Dynamische Seitentitel 
 * (Trainingsplan, Ernährungsplan, etc.)
 */
const pageTitle = ref('Seiten Titel'); 
const pageSubtitle = ref('Seiten Untertitel'); 

/**
 * Wir wählen nun KLASSE je nach Titel,
 * statt border-top inline zu setzen.
 */
const headerClass = computed(() => {
  switch (pageTitle.value.toLowerCase()) {
    case 'trainingsplan':
      return 'header-trainingsplan';
    case 'ernährungsplan':
      return 'header-ernaehrungsplan';
    default:
      return 'header-default';
  }
});
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  margin: 0; /* Kein weißer Rand */
  padding: 0;
}

.full-background {
  min-height: 100%;
  width: 100%;
  transition: background-color 0.3s ease, background 0.3s ease, color 0.3s ease;
}

.header {
  text-align: center;
  margin-bottom: 0;
  /* Im Normal Theme leicht transparent => wird später 
     in Dark/HighContrast überschrieben */
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
}

/* Spezifische Seiten-Farben:
   Statt border-top nutzen wir direkt die Hintergrundfarbe */
.header-trainingsplan {
  background-color: #28a745; /* Grün */
}

.header-ernaehrungsplan {
  background-color: #ffc107; /* Gelb */
}

.header-default {
  background-color: #007bff; /* Blau */
}

/* Separator (dünne Linie) */
.separator {
  width: 100%;
  height: 3px;
  background: var(--separator-color, #ccc);
}

/* Card/Button etc. (wie gehabt) */
.btn {
  border-radius: 20px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}
.btn:hover {
  transform: scale(1.05);
}
.card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.card:hover {
  transform: scale(1.03);
}
</style>
