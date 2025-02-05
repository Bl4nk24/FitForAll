import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importiere deine angepasste CSS-Datei
import './style.css';

// Lese das gespeicherte Theme aus LocalStorage, Standard: 'normal'
const savedTheme = localStorage.getItem('color_contrast') || 'normal';

// Setze die Theme-Klasse auf <html> und <body>
document.documentElement.className = `theme-${savedTheme}`;
document.body.className = `theme-${savedTheme}`;

// Stelle sicher, dass beide Elemente eine einheitliche Schriftgröße haben:
document.documentElement.style.fontSize = '16px';
document.body.style.fontSize = '16px';

// Globale Funktion zum Theme-Wechsel
const toggleTheme = (theme) => {
  document.documentElement.className = `theme-${theme}`;
  document.body.className = `theme-${theme}`;
  document.documentElement.style.fontSize = '16px';
  document.body.style.fontSize = '16px';
  localStorage.setItem('color_contrast', theme);
};

const app = createApp(App);
app.config.globalProperties.$toggleTheme = toggleTheme;
app.use(router).mount('#app');
