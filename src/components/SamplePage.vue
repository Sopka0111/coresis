<template>
  <v-app>
    <!-- AppBar is globally available - no import needed -->
    <AppBar />
    
    <v-main>
      <v-container fluid class="pa-4">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card class="pa-6">
              <v-card-title class="text-h4 mb-4">
                Sample Page
              </v-card-title>
              
              <v-card-text>
                <p class="text-body-1 mb-4">
                  This page demonstrates how the <strong>AppBar</strong> component is globally available 
                  throughout the entire application without needing to import it in each component.
                </p>
                
                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <strong>Global Component Benefits:</strong>
                  <ul class="mt-2">
                    <li>No need to import AppBar in every component</li>
                    <li>Consistent navigation across all pages</li>
                    <li>Centralized component management</li>
                    <li>Easier maintenance and updates</li>
                  </ul>
                </v-alert>
                
                <v-divider class="my-4" />
                
                <h3 class="text-h6 mb-3">Available Global Components:</h3>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-view-dashboard</v-icon>
                    </template>
                    <v-list-item-title>AppBar</v-list-item-title>
                    <v-list-item-subtitle>Navigation bar with school branding</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-chart-bar</v-icon>
                    </template>
                    <v-list-item-title>BarChart</v-list-item-title>
                    <v-list-item-subtitle>Interactive Chart.js component</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
              
              <v-card-actions>
                <v-spacer />
                <v-btn 
                  color="primary" 
                  variant="outlined"
                  @click="goBack"
                >
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back to Dashboard
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// No need to import AppBar - it's globally available!

const goBack = (): void => {
  // Navigate back to main dashboard
  window.history.back()
}
</script>

<style scoped>
.v-main {
  padding-top: 64px; /* Account for app bar height */
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 8px;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.04);
}
</style> 