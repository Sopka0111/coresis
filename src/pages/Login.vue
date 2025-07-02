<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <!-- Left Side - Branding -->
          <v-col cols="12" md="6" class="d-none d-md-flex">
            <v-sheet 
              color="primary"
              class="fill-height d-flex align-center justify-center"
              theme="dark"
            >
              <div class="text-center">
                <v-icon size="120" class="mb-6">mdi-bus-school</v-icon>
                <h1 class="text-h3 font-weight-bold mb-4">
                  School Transportation CRM
                </h1>
                <p class="text-h6 text-medium-emphasis">
                  Streamline your sales and marketing efforts for educational transportation services
                </p>
                <div class="mt-8">
                  <v-chip class="ma-1" variant="outlined">Lead Management</v-chip>
                  <v-chip class="ma-1" variant="outlined">Deal Tracking</v-chip>
                  <v-chip class="ma-1" variant="outlined">Sales Pipeline</v-chip>
                  <v-chip class="ma-1" variant="outlined">Activity Logging</v-chip>
                </div>
              </div>
            </v-sheet>
          </v-col>

          <!-- Right Side - Login Form -->
          <v-col cols="12" md="6">
            <v-sheet class="fill-height d-flex align-center justify-center pa-6">
              <v-card 
                width="100%" 
                max-width="400"
                elevation="0"
                class="pa-6"
              >
                <div class="text-center mb-6">
                  <v-icon size="60" color="primary" class="mb-4">mdi-account-circle</v-icon>
                  <h2 class="text-h4 font-weight-bold text-primary mb-2">
                    Welcome Back
                  </h2>
                  <p class="text-body-1 text-medium-emphasis">
                    Sign in to your CRM account
                  </p>
                </div>

                <v-form @submit.prevent="handleLogin" ref="loginForm">
                  <v-text-field
                    v-model="email"
                    label="Email Address"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :rules="emailRules"
                    :error-messages="errors.email"
                    class="mb-3"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    :rules="passwordRules"
                    :error-messages="errors.password"
                    class="mb-3"
                    required
                  ></v-text-field>

                  <div class="d-flex justify-space-between align-center mb-6">
                    <v-checkbox
                      v-model="rememberMe"
                      label="Remember me"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                    <v-btn variant="text" size="small" color="primary">
                      Forgot password?
                    </v-btn>
                  </div>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    class="mb-4"
                  >
                    Sign In
                  </v-btn>

                  <v-divider class="my-4"></v-divider>

                  <div class="text-center">
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      Don't have an account?
                    </p>
                    <v-btn
                      variant="outlined"
                      color="primary"
                      @click="showRegister = true"
                    >
                      Create Account
                    </v-btn>
                  </div>
                </v-form>

                <!-- Demo Credentials -->
                <v-card 
                  color="surface-variant" 
                  class="mt-6 pa-4"
                  variant="tonal"
                >
                  <div class="text-center">
                    <p class="text-body-2 font-weight-bold mb-2">Demo Credentials</p>
                    <p class="text-caption mb-1">Admin: admin@crm.com / admin123</p>
                    <p class="text-caption mb-1">Sales Rep: sales@crm.com / sales123</p>
                    <p class="text-caption">Marketing: marketing@crm.com / marketing123</p>
                  </div>
                </v-card>
              </v-card>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Registration Dialog -->
    <v-dialog v-model="showRegister" max-width="500" persistent>
      <v-card class="pa-6">
        <v-card-title class="text-center">
          <h3 class="text-h5 font-weight-bold text-primary">Create Account</h3>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleRegister" ref="registerForm">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registerData.firstName"
                  label="First Name"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="registerData.lastName"
                  label="Last Name"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="registerData.email"
              label="Email Address"
              type="email"
              :rules="emailRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="registerData.password"
              label="Password"
              type="password"
              :rules="passwordRules"
              required
            ></v-text-field>

            <v-select
              v-model="registerData.role"
              label="Role"
              :items="roles"
              :rules="[v => !!v || 'Role is required']"
              required
            ></v-select>

            <v-text-field
              v-model="registerData.phone"
              label="Phone Number (Optional)"
            ></v-text-field>

            <v-text-field
              v-model="registerData.department"
              label="Department (Optional)"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-btn variant="text" @click="showRegister = false">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="handleRegister"
            :loading="loading"
          >
            Create Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCrmStore } from '@/stores/crm'
import { storeToRefs } from 'pinia'

const router = useRouter()
const crmStore = useCrmStore()
const { loading } = storeToRefs(crmStore)

// Form refs
const loginForm = ref(null)
const registerForm = ref(null)

// Login form data
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

// Registration form data
const showRegister = ref(false)
const registerData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  phone: '',
  department: ''
})

// Form errors
const errors = reactive({
  email: [],
  password: []
})

// Form validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => (v && v.length >= 6) || 'Password must be at least 6 characters'
]

const nameRules = [
  v => !!v || 'This field is required',
  v => (v && v.length >= 2) || 'Must be at least 2 characters'
]

const roles = [
  { title: 'Admin', value: 'Admin' },
  { title: 'Sales Rep', value: 'Sales Rep' },
  { title: 'Marketing Agent', value: 'Marketing Agent' }
]

// Methods
const handleLogin = async () => {
  const { valid } = await loginForm.value.validate()
  if (!valid) return

  // Clear previous errors
  errors.email = []
  errors.password = []

  const result = await crmStore.login(email.value, password.value)
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    // Handle specific login errors
    if (result.error.includes('email')) {
      errors.email = [result.error]
    } else if (result.error.includes('password')) {
      errors.password = [result.error]
    }
  }
}

const handleRegister = async () => {
  const { valid } = await registerForm.value.validate()
  if (!valid) return

  const result = await crmStore.register(registerData)
  
  if (result.success) {
    showRegister.value = false
    router.push('/dashboard')
  }
}

// Demo login function
const loginWithDemo = (role) => {
  const demoCredentials = {
    Admin: { email: 'admin@crm.com', password: 'admin123' },
    'Sales Rep': { email: 'sales@crm.com', password: 'sales123' },
    'Marketing Agent': { email: 'marketing@crm.com', password: 'marketing123' }
  }
  
  const creds = demoCredentials[role]
  if (creds) {
    email.value = creds.email
    password.value = creds.password
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.v-card {
  transition: transform 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.v-chip {
  transition: all 0.3s ease;
}

.v-chip:hover {
  transform: scale(1.05);
}
</style>