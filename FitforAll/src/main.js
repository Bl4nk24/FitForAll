import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importiere deine angepasste CSS-Datei, die die Theme‑Klassen enthält
import './style.css';

/*
  WICHTIG: Stelle sicher, dass in deiner index.html im <head> folgender Meta-Tag steht,
  um automatische Skalierung (Zoom) zu verhindern:
  <meta name="viewport" content="width=device-width, initial-scale=1">
*/

// Lese das gespeicherte Theme aus LocalStorage, Standard: 'normal'
const savedTheme = localStorage.getItem('color_contrast') || 'normal';

// Setze die Theme-Klasse auf beiden Wurzel-Elementen (<html> und <body>)
// und lege eine einheitliche Basis-Schriftgröße fest.
document.documentElement.className = `theme-${savedTheme}`;
document.body.className = `theme-${savedTheme}`;

// Stelle sicher, dass beide Elemente eine einheitliche Schriftgröße haben:
document.documentElement.style.fontSize = '16px';
document.body.style.fontSize = '16px';

const toggleTheme = (theme) => {
  // Setze den Klassennamen auf <html> und <body>
  document.documentElement.className = `theme-${theme}`;
  document.body.className = `theme-${theme}`;
  // Stelle sicher, dass die Basis-Schriftgröße unverändert bleibt:
  document.documentElement.style.fontSize = '16px';
  document.body.style.fontSize = '16px';
  localStorage.setItem('color_contrast', theme);
};

const app = createApp(App);
app.config.globalProperties.$toggleTheme = toggleTheme;
app.use(router).mount('#app');
