import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const customTheme = {
  dark: false,
  colors: {
    // Primary: Light Green palette
    primary: '#4CAF50',        // Material Green 500
    'primary-lighten-1': '#66BB6A', // Material Green 400
    'primary-lighten-2': '#81C784', // Material Green 300
    'primary-lighten-3': '#A5D6A7', // Material Green 200
    'primary-lighten-4': '#C8E6C9', // Material Green 100
    'primary-darken-1': '#43A047',  // Material Green 600
    'primary-darken-2': '#388E3C',  // Material Green 700
    'primary-darken-3': '#2E7D32',  // Material Green 800
    'primary-darken-4': '#1B5E20',  // Material Green 900

    // Secondary: Blue palette
    secondary: '#2196F3',      // Material Blue 500
    'secondary-lighten-1': '#42A5F5', // Material Blue 400
    'secondary-lighten-2': '#64B5F6', // Material Blue 300
    'secondary-lighten-3': '#90CAF9', // Material Blue 200
    'secondary-lighten-4': '#BBDEFB', // Material Blue 100
    'secondary-darken-1': '#1E88E5',  // Material Blue 600
    'secondary-darken-2': '#1976D2',  // Material Blue 700
    'secondary-darken-3': '#1565C0',  // Material Blue 800
    'secondary-darken-4': '#0D47A1',  // Material Blue 900

    // Accent: Complementary colors
    accent: '#FF9800',         // Material Orange 500
    info: '#00BCD4',          // Material Cyan 500
    success: '#4CAF50',       // Material Green 500 (same as primary)
    warning: '#FF9800',       // Material Orange 500
    error: '#F44336',         // Material Red 500

    // Background colors
    background: '#FAFAFA',     // Very light grey
    surface: '#FFFFFF',       // Pure white
    'surface-variant': '#F5F5F5', // Light grey

    // Text colors
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#FFFFFF',
    'on-success': '#FFFFFF',
    'on-warning': '#FFFFFF',
    'on-error': '#FFFFFF',
    'on-background': '#212121',
    'on-surface': '#212121',

    // CRM specific colors
    'lead-new': '#E3F2FD',        // Light blue
    'lead-contacted': '#F3E5F5',   // Light purple
    'lead-qualified': '#E8F5E8',   // Light green
    'lead-proposal': '#FFF3E0',    // Light orange
    'lead-won': '#E8F5E8',         // Light green
    'lead-lost': '#FFEBEE',        // Light red

    // Deal stage colors
    'deal-prospecting': '#E3F2FD',  // Light blue
    'deal-qualification': '#F3E5F5', // Light purple
    'deal-needs-analysis': '#E0F2F1', // Light teal
    'deal-proposal': '#FFF3E0',     // Light orange
    'deal-negotiation': '#FCE4EC',  // Light pink
    'deal-decision': '#F1F8E9',     // Light lime
    'deal-won': '#E8F5E8',          // Light green
    'deal-lost': '#FFEBEE',         // Light red
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme
    }
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VBtn: {
      rounded: 'lg',
      style: 'text-transform: none;'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VTextarea: {
      variant: 'outlined'
    },
    VDataTable: {
      elevation: 1,
      rounded: 'lg'
    },
    VDialog: {
      rounded: 'xl'
    },
    VSheet: {
      rounded: 'lg'
    }
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },
  icons: {
    defaultSet: 'mdi'
  }
})

export default vuetify 