import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importiere deine angepasste CSS-Datei, in der die Theme-Klassen definiert sind
import './style.css';

// Theme aus LocalStorage auslesen, Standardwert: 'normal'
const savedTheme = localStorage.getItem('color_contrast') || 'normal';
document.body.className = `theme-${savedTheme}`;

// Globale Funktion zum Ändern des Themes
const toggleTheme = (theme) => {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('color_contrast', theme);
};

const app = createApp(App);

// Diese Funktion wird global bereitgestellt, sodass du sie z. B. in deiner NavigationBar nutzen kannst.
app.config.globalProperties.$toggleTheme = toggleTheme;

app.use(router).mount('#app');
