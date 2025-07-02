import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#8BC34A',      // Light green - wellness primary
          secondary: '#C5E1A5',    // Light green secondary
          accent: '#66BB6A',       // Complementary green
          error: '#F44336',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',
          background: '#F1F8E9',   // Light green background
          surface: '#FFFFFF',
          'on-primary': '#FFFFFF',
          'on-secondary': '#2E7D32',
          'on-background': '#1B5E20',
          'on-surface': '#212121',
          'wellness-light': '#DCEDC8',
          'wellness-dark': '#689F38'
        }
      },
      dark: {
        colors: {
          primary: '#8BC34A',
          secondary: '#C5E1A5',
          accent: '#66BB6A',
          error: '#F44336',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',
          background: '#1B5E20',
          surface: '#2E7D32',
          'wellness-light': '#DCEDC8',
          'wellness-dark': '#689F38'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi'
  }
}) 