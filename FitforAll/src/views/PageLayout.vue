<template>
  <!-- Keine lokale :class mehr! -->
  <div class="page">
    <div class="full-background">
      <section class="header py-5" :style="headerStyle">
        <div class="container">
          <h1 class="display-4 fw-bold">{{ pageTitle }}</h1>
          <p class="lead">{{ pageSubtitle }}</p>
        </div>
      </section>
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

// Beispiel: farbige Linie im Header (oben) je nach Seite
const headerStyle = computed(() => {
  switch (pageTitle.value.toLowerCase()) {
    case 'ernährungsplan':
      return 'border-top: 10px solid yellow';
    case 'trainingsplan':
      return 'border-top: 10px solid green';
    default:
      return 'border-top: 10px solid blue';
  }
});
</script>

<!-- Kein 'scoped', damit .theme-dark etc. überall greifen kann -->
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
}

.header {
  text-align: center;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn {
  border-radius: 20px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
}

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
