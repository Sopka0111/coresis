<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card>
          <v-card-title class="text-h4 text-center text-primary">
            🌿 Trade School SIS - Test
          </v-card-title>
          <v-card-text class="text-center">
            <p class="text-h6">System is working!</p>
            <v-btn color="primary" @click="count++">
              Clicked {{ count }} times
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script> 