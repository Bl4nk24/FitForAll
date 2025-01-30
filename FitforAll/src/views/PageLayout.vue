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
import { computed } from 'vue';

/**
 * Props für dynamische Titel/Subtitel
 * Titel & Untertitel übergeben (z.B. in einer Eltern-Komponente):
 * <PageLayout
 *   pageTitle="Ernährungsplan"
 *   pageSubtitle="Dein Weg zur optimalen Ernährung"
 * >
 *   ... dein Inhalt ...
 * </PageLayout>
 */
const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Seiten Titel'
  },
  pageSubtitle: {
    type: String,
    default: 'Seiten Untertitel'
  }
});

/**
 * Dynamische Klasse auf Basis des Titles
 * (z.B. anderer Header-Hintergrund für Trainingsplan / Ernährungsplan)
 */
const headerClass = computed(() => {
  switch (props.pageTitle.toLowerCase()) {
    case 'trainingsplan':
      return 'header-trainingsplan';
    case 'ernährungsplan':
      return 'header-ernaehrungsplan';
    default:
      return 'header-default';
  }
});
</script>

<style scoped>
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
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
}

/* Verschiedene Header-Farben je nach Seite */
.header-trainingsplan {
  background-color: #28a745; /* Grün */
}

.header-ernaehrungsplan {
  background-color: #ffc107; /* Gelb */
}

.header-default {
  background-color: #007bff; /* Blau */
}

/* Kleiner Trenner unter dem Header */
.separator {
  width: 100%;
  height: 3px;
  background: var(--separator-color, #ccc);
}

/* Beispielhafte Styles für Buttons oder Cards */
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
