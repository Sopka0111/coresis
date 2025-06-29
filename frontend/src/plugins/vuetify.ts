import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// CoreSIS Theme Configuration
const coresisTheme = {
  dark: false,
  colors: {
    primary: '#8bc34a',         // light-green
    secondary: '#689f38',       // darken-2
    accent: '#c5e1a5',          // lighten-3
    background: '#f1f8e9',      // lighten-5
    surface: '#ffffff',
    success: '#7cb342',
    info: '#aed581',
    warning: '#ffc107',
    error: '#e53935',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-accent': '#000000',
    'on-background': '#000000',
    'on-surface': '#000000',
    'on-success': '#ffffff',
    'on-info': '#000000',
    'on-warning': '#000000',
    'on-error': '#ffffff',
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'coresisTheme',
    themes: {
      coresisTheme
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      elevation: 2
    },
    VBtn: {
      rounded: 'lg',
      elevation: 1
    },
    VTextField: {
      variant: 'outlined',
      rounded: 'lg'
    },
    VSelect: {
      variant: 'outlined',
      rounded: 'lg'
    },
    VTextarea: {
      variant: 'outlined',
      rounded: 'lg'
    },
    VDataTable: {
      rounded: 'lg'
    },
    VNavigationDrawer: {
      color: 'surface'
    },
    VAppBar: {
      color: 'primary',
      elevation: 0
    }
  }
}) 