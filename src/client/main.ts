import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import * as luxon from 'luxon'
window.luxon = luxon
import './main.css'
import 'tabulator-tables/dist/css/tabulator_simple.min.css'
import 'font-awesome/css/font-awesome.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
