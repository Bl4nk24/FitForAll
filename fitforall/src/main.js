import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


// Optional: Bootstrap CSS/JS aus node_modules (anstatt über index.html)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Initialisiere das Farbschema aus localStorage
const savedTheme = localStorage.getItem('color_contrast') || 'normal';
document.body.className = `theme-${savedTheme}`;

// App starten
createApp(App).use(router).mount('#app');
