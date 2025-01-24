<template>
    <!-- Nur anzeigen, wenn screenreader aktiviert (localStorage= 'true') -->
    <button
      v-if="isScreenreaderOn"
      class="screenreader-button"
      @click="toggleReading"
    >
      {{ isReading ? 'Stopp' : 'Vorlesen' }}
    </button>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // 1) Prüfen, ob screenreader in localStorage = 'true'
  const stored = localStorage.getItem('screenreader') || 'false';
  const screenreaderActive = ref(stored === 'true');
  
  // 2) Computed, ob wir den Button anzeigen
  const isScreenreaderOn = computed(() => screenreaderActive.value);
  
  // 3) Status: Wird gerade vorgelesen?
  const isReading = ref(false);
  
  // 4) Toggle-Funktion: Start oder Stop
  function toggleReading() {
    if (!isReading.value) {
      // Start Vorlesen
      startReading();
    } else {
      // Stop Vorlesen
      stopReading();
    }
  }
  
  // 5) Vorlese-Funktion
  function startReading() {
    isReading.value = true; // Wir lesen jetzt
    // Text ermitteln – z. B. Hauptbereich "main-content"
    const mainContent = document.getElementById('main-content');
    const text = mainContent ? mainContent.innerText : document.body.innerText;
    if (!text) return;
  
    // Falls irgendwas gerade gelesen wird, erst abbrechen
    speechSynthesis.cancel();
  
    // Neues Utterance-Objekt
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
  
    // Wenn das Vorlesen fertig ist, schalten wir isReading zurück
    utterance.onend = () => {
      isReading.value = false;
    };
  
    // Jetzt starten
    speechSynthesis.speak(utterance);
  }
  
  // 6) Stop-Funktion
  function stopReading() {
    isReading.value = false;
    speechSynthesis.cancel();
  }
  </script>
  
  <!-- 
    .screenreader-button-Klasse sollte in style.css stehen,
    damit der Button unten rechts fixiert ist. Beispiel:
    
    .screenreader-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      ...
    }
  -->
  