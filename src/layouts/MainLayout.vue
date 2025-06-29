<template>
  <v-app>
    <!-- Navigation Drawer -->
    <NavigationDrawer 
      v-model="drawerOpen"
      @navigation="handleNavigation"
      @logout="handleLogout"
    />
    
    <!-- AppBar is globally available - no import needed -->
    <AppBar @toggle-drawer="toggleDrawer" />
    
    <!-- Main Content Area -->
    <v-main>
      <v-container fluid class="pa-4">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <!-- Page Header -->
            <v-card class="mb-4">
              <v-card-title class="text-h4 text-center pa-6">
                Vue 3 + Vuetify + Chart.js Dashboard
              </v-card-title>
            </v-card>
            
            <!-- Main Content Slot -->
            <slot name="content">
              <!-- Default content if no slot is provided -->
              <BarChart />
              
              <v-card class="mt-4 pa-4">
                <v-card-title class="text-h6">
                  Features
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Responsive Design</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Vuetify Integration</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Chart.js with Vue 3 Composition API</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Proper Memory Management</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Professional App Bar</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Navigation Drawer</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Global Component Registration</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>Layout System</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </slot>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
    <!-- Footer Slot -->
    <slot name="footer">
      <!-- Default footer if no slot is provided -->
      <v-footer class="bg-primary text-white text-center pa-4">
        <v-container>
          <p class="mb-0">
            © 2024 Center for Natural Wellness School of Massage. All rights reserved.
          </p>
        </v-container>
      </v-footer>
    </slot>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Navigation drawer state
const drawerOpen = ref(true)

// Methods
const toggleDrawer = (): void => {
  drawerOpen.value = !drawerOpen.value
}

const handleNavigation = (href: string): void => {
  console.log('Navigation to:', href)
  // Add your navigation logic here
  // You can integrate with Vue Router or handle external links
}

const handleLogout = (): void => {
  console.log('Logout requested')
  // Add your logout logic here
  // Example: redirect to logout page
  // window.location.href = '/logout'
}
</script>

<style scoped>
.v-main {
  padding-top: 64px; /* Account for app bar height */
  min-height: calc(100vh - 64px - 80px); /* Full height minus app bar and footer */
}

.v-footer {
  margin-top: auto;
}
</style> 