import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importiere deine angepasste CSS-Datei, die die Theme‑Klassen und Schriftgrößen enthält
import './style.css';

// Lese das gespeicherte Theme aus LocalStorage, Standard: 'normal'
const savedTheme = localStorage.getItem('color_contrast') || 'normal';

// Setze die Theme-Klasse auf <html> und <body>
document.documentElement.className = `theme-${savedTheme}`;
document.body.className = `theme-${savedTheme}`;

// Globale Toggle-Funktion fürs Theme
const toggleTheme = (theme) => {
  document.documentElement.className = `theme-${theme}`;
  document.body.className = `theme-${theme}`;
  localStorage.setItem('color_contrast', theme);
};

const app = createApp(App);
app.config.globalProperties.$toggleTheme = toggleTheme;
app.use(router).mount('#app');
