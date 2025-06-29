import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import globalComponents from './plugins/global-components'

const app = createApp(App)

// Use plugins
app.use(vuetify)
app.use(globalComponents)

// Mount the app
app.mount('#app') 