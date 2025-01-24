import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Theme aus LocalStorage auslesen, default: 'normal'
const savedTheme = localStorage.getItem('color_contrast') || 'normal';
document.body.className = `theme-${savedTheme}`;
// Globale Funktion zum Ändern des Themes
const toggleTheme = (theme) => {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('color_contrast', theme);
};
const app = createApp(App);
// Globale Funktion bereitstellen
app.config.globalProperties.$toggleTheme = toggleTheme;
app.use(router).mount('#app');