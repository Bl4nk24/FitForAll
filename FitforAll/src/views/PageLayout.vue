<template>
    <div :class="['page', themeClass]">
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
  
  // Dynamische Themenwahl basierend auf dem Benutzerprofil
  const theme = ref('normal'); // Hier "normal" als Standard setzen
  const themeClass = computed(() => `theme-${theme.value}`);
  
  // Seiteninformationen dynamisch setzen
  const pageTitle = ref('Seiten Titel'); // Dynamisch setzen pro Seite
  const pageSubtitle = ref('Seiten Untertitel'); // Dynamisch setzen pro Seite
  
  // Spezifische Stile pro Seite
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
  
  <style scoped>
  /* Standard-Stile */
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    height: 100%;
    width: 100%;
    background-color: var(--bg-color, #1a1a1a); /* Standard Dunkel */
    color: var(--text-color, white);
  }
  
  .full-background {
    min-height: 100%;
    height: 100%;
    width: 100%;
  }
  
  /* Dunkles Theme */
  .theme-dark {
    --bg-color: #1a1a1a;
    --text-color: white;
  }
  
  /* Normales Theme */
  .theme-normal {
    --bg-color: white;
    --text-color: black;
  }
  
  /* High-Contrast Theme */
  .theme-high-contrast {
    --bg-color: black;
    --text-color: yellow;
  }
  
  .header {
    text-align: center;
    background-color: var(--bg-color);
    color: var(--text-color);
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
  