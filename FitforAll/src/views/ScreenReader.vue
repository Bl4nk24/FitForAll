<template>
  <div v-if="isScreenreaderOn" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
    <button class="screenreader-button" @click="readPage">
      Vorlesen
    </button>
    <button class="screenreader-button" @click="pauseReading">
      Pause
    </button>
    <button class="screenreader-button" @click="stopReading">
      Stop
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 1) Prüfen, ob screenreader = 'true' in localStorage
const stored = localStorage.getItem('screenreader') || 'false';
const screenreaderActive = ref(stored === 'true');

// 2) Computed, ob wir die Buttons anzeigen
const isScreenreaderOn = computed(() => screenreaderActive.value);

// 3) Vorlesen (gesamte Seite oder nur Hauptbereich)
function readPage() {
  // Hier z.B. nur den Inhalt von #main-content
  const mainContent = document.getElementById('main-content');
  const text = mainContent ? mainContent.innerText : document.body.innerText;
  if (!text) return;

  // Falls bereits etwas gelesen wird: erst stoppen
  speechSynthesis.cancel();

  // Neues Utterance-Objekt
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE'; 
  // Optional: Rate, Pitch etc. (utterance.rate = 1.0, utterance.pitch = 1.0, ...)
  
  speechSynthesis.speak(utterance);
}

// 4) Pause
function pauseReading() {
  speechSynthesis.pause();
}

// 5) Stop
function stopReading() {
  speechSynthesis.cancel();
}
</script>

<!-- Kein style-Block nötig, wir nutzen die globale .screenreader-button -->
