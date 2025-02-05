<template>
  <!-- Der Button wird nur angezeigt, wenn der Screenreader aktiviert ist (localStorage === 'true') -->
  <button
    v-if="screenreaderActive"
    class="screenreader-button"
    @click="toggleReading"
  >
    {{ isReading ? 'Stopp' : 'Vorlesen' }}
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Reaktiver Status, ob der Screenreader aktiviert ist
const screenreaderActive = ref(false);
// Reaktiver Status, ob gerade vorgelesen wird
const isReading = ref(false);

// Beim Mounten der Komponente den localStorage-Wert einlesen
onMounted(() => {
  screenreaderActive.value = localStorage.getItem('screenreader') === 'true';
});

// Optional: Falls sich der localStorage-Wert (z. B. in einem anderen Tab) ändert, wird dieser Listener aktiv
window.addEventListener('storage', (e) => {
  if (e.key === 'screenreader') {
    screenreaderActive.value = e.newValue === 'true';
  }
});

// Toggle-Funktion: Startet oder stoppt das Vorlesen
function toggleReading() {
  if (!isReading.value) {
    startReading();
  } else {
    stopReading();
  }
}

// Startet das Vorlesen des Inhalts
function startReading() {
  isReading.value = true;
  // Text aus dem Element mit der ID "main-content" ermitteln, alternativ den gesamten Body-Text
  const mainContent = document.getElementById('main-content');
  const text = mainContent ? mainContent.innerText : document.body.innerText;
  if (!text) return;

  // Falls bereits etwas vorgelesen wird, abbrechen
  speechSynthesis.cancel();

  // Erstelle ein neues SpeechSynthesisUtterance-Objekt
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';

  // Wenn das Vorlesen beendet ist, setze den Status zurück
  utterance.onend = () => {
    isReading.value = false;
  };

  // Vorlesen starten
  speechSynthesis.speak(utterance);
}

// Stoppt das Vorlesen
function stopReading() {
  isReading.value = false;
  speechSynthesis.cancel();
}
</script>

<!-- 
  Hinweis: Stelle sicher, dass in deiner style.css die CSS-Klasse .screenreader-button definiert ist,
  damit der Button unten rechts fixiert und in allen Themes sichtbar ist.
-->
