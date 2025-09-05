<script setup lang="ts">
import { useRoute, navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false
})

const route = useRoute()
const toast = useToast()
const { login, authErrors } = useAuth()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})
const showPassword = ref(false)
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const result = await login({
      email: form.value.email,
      password: form.value.password,
      remember: form.value.remember
    })

    if (result.success) {
      toast.add({ title: 'Login successful', color: 'success' })
    } else {
      toast.add({ title: 'Login failed', color: 'error' })
    }
  } catch {
    toast.add({ title: 'Login failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  navigateTo('/forgot-password')
}

const handleSignUp = () => {
  navigateTo('/register')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
          <UIcon name="i-lucide-shield" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <!-- Login Form -->
      <UCard class="shadow-xl border-0">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="pb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <UInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              :ui="{ 
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset dark:placeholder:text-gray-500 sm:text-sm sm:leading-6 rounded-lg'
              }"
              :disabled="loading"
            />
            <p v-if="errors.email" class="text-sm text-red-600 dark:text-red-400">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <UInput
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="w-full"
              :ui="{ 
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset dark:placeholder:text-gray-500 sm:text-sm sm:leading-6 rounded-lg'
              }"
              :disabled="loading"
            >
              <template #trailing>
                <button
                  type="button"
                  class="px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="toggleShowPassword"
                  aria-label="Toggle password visibility"
                >
                  <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
            <p v-if="errors.password" class="text-sm text-red-600 dark:text-red-400">
              {{ errors.password }}
            </p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <UCheckbox
              v-model="form.remember"
              name="remember"
              label="Remember me"
              :disabled="loading"
            />
            <UButton
              variant="link"
              color="primary"
              size="sm"
              :disabled="loading"
              @click="handleForgotPassword"
            >
              Forgot password?
            </UButton>
          </div>

          <!-- Submit Button -->
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            :loading="loading"
            :disabled="loading"
            class="max-w-sm"
          >
            <UIcon v-if="!loading" name="i-lucide-log-in" class="w-4 h-4" />
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </UButton>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <UButton
            variant="outline"
            color="neutral"
            :disabled="loading"
            class="w-full"
          >
            <UIcon name="i-simple-icons-google" class="w-4 h-4" />
            Google
          </UButton>
          <UButton
            variant="outline"
            color="neutral"
            :disabled="loading"
            class="w-full"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            GitHub
          </UButton>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <UButton
              variant="link"
              color="primary"
              size="sm"
              :disabled="loading"
              @click="handleSignUp"
            >
              Sign up
            </UButton>
          </p>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          By signing in, you agree to our
          <UButton variant="link" color="neutral" size="xs">Terms of Service</UButton>
          and
          <UButton variant="link" color="neutral" size="xs">Privacy Policy</UButton>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom gradient background */
.bg-gradient-to-br {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.dark .bg-gradient-to-br {
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Focus styles */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark input:focus {
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}
</style> 