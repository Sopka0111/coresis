import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

const app = createApp(App)

// Use plugins
app.use(vuetify)

// Mount the app
app.mount('#app') 