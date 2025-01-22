import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Optional: Bootstrap CSS/JS aus node_modules (anstatt über index.html)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Initialisiere das Farbschema aus localStorage
const savedTheme = localStorage.getItem('color_contrast') || 'normal';
document.body.className = `theme-${savedTheme}`;

// Globale Funktion zur Änderung des Farbschemas
const toggleTheme = (theme) => {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('color_contrast', theme); // Speichert die Auswahl
};

// App starten
const app = createApp(App);

// Globale Funktion bereitstellen
app.config.globalProperties.$toggleTheme = toggleTheme;

// Router hinzufügen und App mounten
app.use(router).mount('#app');
