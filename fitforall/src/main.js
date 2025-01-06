import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Optional: Bootstrap CSS/JS aus node_modules (anstatt über index.html)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createApp(App).use(router).mount('#app')
