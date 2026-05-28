import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.scss'
import App from './App.vue'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Viewer)
app.mount('#app')