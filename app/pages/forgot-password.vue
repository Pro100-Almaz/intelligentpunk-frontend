<script setup lang="ts">
definePageMeta({
  layout: false
})

const toast = useToast()
const { forgotPassword, authErrors, successMessage } = useAuth()

const form = reactive({
  email: ''
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}
  
  if (!form.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleForgotPassword = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const result = await forgotPassword(form.email)
    
    if (result.success) {
      toast.add({
        title: 'Reset email sent',
        description: 'Check your inbox for password reset instructions.',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Failed to send reset email',
        description: 'Please check your email address and try again.',
        color: 'error'
      })
    }
    
  } catch (error) {
    toast.add({
      title: 'An error occurred',
      description: 'Please try again later.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleBackToLogin = () => {
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
          <UIcon name="i-lucide-lock" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <!-- Forgot Password Form -->
      <UCard class="shadow-xl border-0">
        <form @submit.prevent="handleForgotPassword" class="space-y-6">
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

          <!-- General Errors -->
          <div v-if="authErrors.general?.[0]" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ authErrors.general[0] }}
            </p>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p class="text-sm text-green-600 dark:text-green-400">
              {{ successMessage }}
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
            <UIcon v-if="!loading" name="i-lucide-mail" class="w-4 h-4" />
            {{ loading ? 'Sending...' : 'Send reset link' }}
          </UButton>
        </form>

        <!-- Back to Login -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?
            <UButton
              variant="link"
              color="primary"
              size="sm"
              :disabled="loading"
              @click="handleBackToLogin"
            >
              Back to login
            </UButton>
          </p>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Need help? Contact our
          <UButton variant="link" color="neutral" size="xs">support team</UButton>
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