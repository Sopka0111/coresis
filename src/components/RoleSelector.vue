<template>
  <v-card class="role-selector">
    <v-card-title class="text-h6">
      <v-icon left>mdi-account-switch</v-icon>
      Role Selector (Demo)
    </v-card-title>
    <v-card-text>
      <p class="text-body-2 mb-4">
        Switch between different user roles to test access control features.
      </p>
      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="role in availableRoles" :key="role.value">
          <v-card 
            :variant="currentRole === role.value ? 'elevated' : 'outlined'"
            :color="currentRole === role.value ? 'primary' : undefined"
            class="role-card"
            @click="setRole(role.value)"
          >
            <v-card-text class="text-center pa-4">
              <v-icon 
                size="32" 
                :color="currentRole === role.value ? 'white' : 'primary'"
                class="mb-2"
              >
                {{ role.icon }}
              </v-icon>
              <div 
                class="text-subtitle-1 font-weight-medium"
                :class="currentRole === role.value ? 'text-white' : ''"
              >
                {{ role.label }}
              </div>
              <div 
                class="text-caption"
                :class="currentRole === role.value ? 'text-white' : 'text-medium-emphasis'"
              >
                {{ role.description }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth, type UserRole } from '@/composables/useAuth'

const { userRole, setUserRole } = useAuth()

const currentRole = computed(() => userRole.value)

const availableRoles = [
  {
    value: 'admin' as UserRole,
    label: 'Administrator',
    description: 'Full access to all features',
    icon: 'mdi-shield-crown'
  },
  {
    value: 'finance' as UserRole,
    label: 'Finance',
    description: 'Financial data and exports',
    icon: 'mdi-calculator'
  },
  {
    value: 'registrar' as UserRole,
    label: 'Registrar',
    description: 'Student management',
    icon: 'mdi-account-group'
  },
  {
    value: 'instructor' as UserRole,
    label: 'Instructor',
    description: 'Basic student view',
    icon: 'mdi-teach'
  },
  {
    value: 'student' as UserRole,
    label: 'Student',
    description: 'Limited access',
    icon: 'mdi-account'
  }
]

const setRole = (role: UserRole) => {
  setUserRole(role)
}
</script>

<style scoped>
.role-selector {
  margin-bottom: 24px;
}

.role-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.role-card.v-card--elevated {
  transform: translateY(-2px);
}
</style> 