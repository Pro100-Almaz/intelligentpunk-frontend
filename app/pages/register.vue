<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const toast = useToast()
const { register, authErrors } = useAuth()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}
  
  if (!form.username) {
    errors.value.username = 'Username is required'
  } else if (form.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters'
  }
  
  if (!form.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (!form.password) {
    errors.value.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  if (!form.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (form.password !== form.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const result = await register({
      username: form.username,
      email: form.email,
      password: form.password,
      password_confirm: form.confirmPassword
    })
    
    if (result.success) {
      toast.add({
        title: 'Registration successful',
        description: 'Welcome! Your account has been created.',
        color: 'success'
      })
      
      // Redirect to intended page or dashboard
      const redirectTo = route.query.redirect as string || '/'
      await navigateTo(redirectTo)
    } else {
      toast.add({
        title: 'Registration failed',
        description: 'Please check your information and try again.',
        color: 'error'
      })
    }
    
  } catch (error) {
    toast.add({
      title: 'Registration failed',
      description: 'An unexpected error occurred. Please try again.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleLogin = () => {
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
          <UIcon name="i-lucide-user-plus" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Join us and start your journey
        </p>
      </div>

      <!-- Registration Form -->
      <UCard class="shadow-xl border-0">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="pb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <UInput
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Enter your username"
              class="w-full"
              :ui="{ 
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset dark:placeholder:text-gray-500 sm:text-sm sm:leading-6 rounded-lg'
              }"
              :disabled="loading"
            />
            <p v-if="errors.username || authErrors.username?.[0]" class="text-sm text-red-600 dark:text-red-400 mt-1">
              {{ errors.username || authErrors.username?.[0] }}
            </p>
          </div>

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
            <p v-if="errors.email || authErrors.email?.[0]" class="text-sm text-red-600 dark:text-red-400 mt-1">
              {{ errors.email || authErrors.email?.[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="pb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <UInput
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              class="w-full"
              :ui="{ 
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset dark:placeholder:text-gray-500 sm:text-sm sm:leading-6 rounded-lg'
              }"
              :disabled="loading"
            />
            <p v-if="errors.password || authErrors.password?.[0]" class="text-sm text-red-600 dark:text-red-400 mt-1">
              {{ errors.password || authErrors.password?.[0] }}
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="pb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <UInput
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              class="w-full"
              :ui="{ 
                base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-inset dark:placeholder:text-gray-500 sm:text-sm sm:leading-6 rounded-lg'
              }"
              :disabled="loading"
            />
            <p v-if="errors.confirmPassword" class="text-sm text-red-600 dark:text-red-400 mt-1">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- General Errors -->
          <div v-if="authErrors.general?.[0]" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ authErrors.general[0] }}
            </p>
          </div>

          <!-- Submit Button -->
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            :loading="loading"
            :disabled="loading"
            class="w-full"
          >
            <UIcon v-if="!loading" name="i-lucide-user-plus" class="w-4 h-4" />
            {{ loading ? 'Creating account...' : 'Create account' }}
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

        <!-- Social Registration Buttons -->
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

        <!-- Login Link -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <UButton
              variant="link"
              color="primary"
              size="sm"
              :disabled="loading"
              @click="handleLogin"
            >
              Sign in
            </UButton>
          </p>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          By creating an account, you agree to our
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