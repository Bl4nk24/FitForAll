<template>
  <div class="page">
    <div class="full-background">
      <!-- Header-Bereich -->
      <section class="header py-5" :style="headerStyle">
        <div class="container">
          <h1 class="display-4 fw-bold">{{ pageTitle }}</h1>
          <p class="lead">{{ pageSubtitle }}</p>
        </div>
      </section>

      <!-- Neuer Trenner -->
      <div class="separator"></div>

      <!-- Hauptinhalt -->
      <section class="container py-5">
        <slot></slot>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Dynamische Seitentitel und Untertitel (nur als Beispiel)
const pageTitle = ref('Seiten Titel'); 
const pageSubtitle = ref('Seiten Untertitel'); 

// Beispiel: farbige Linie oben je nach Seite
const headerStyle = computed(() => {
  switch (pageTitle.value.toLowerCase()) {
    case 'ernährungsplan':
      return 'border-top: 10px solid #ffc107'; // Gelb
    case 'trainingsplan':
      return 'border-top: 10px solid #28a745'; // Grün
    default:
      return 'border-top: 10px solid #007bff'; // Blau
  }
});
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.full-background {
  min-height: 100%;
  width: 100%;
  transition: background-color 0.3s ease, background 0.3s ease, color 0.3s ease;
}

/* Header */
.header {
  text-align: center;
  transition: background-color 0.3s ease, color 0.3s ease;
  /* Keine margin-bottom mehr, damit kein weißer Balken */
  margin-bottom: 0;
  border-radius: 0 0 8px 8px;
  /* optional leichte Transparenz im Normal-Theme */
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid #ddd;
}

/* NEUE TRENNER-LINIE */
.separator {
  width: 100%;
  height: 3px; /* etwas höher als eine Standard-HR */
  background: var(--separator-color, #ccc); /* Fallback-Farbe */
}

/* Buttons */
.btn {
  border-radius: 20px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
.btn:hover {
  transform: scale(1.05);
}

/* Cards */
.card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.card:hover {
  transform: scale(1.03);
}
</style>
