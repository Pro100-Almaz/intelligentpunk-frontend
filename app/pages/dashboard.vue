<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { user, logout } = useAuth()
const toast = useToast()

const handleLogout = () => {
  logout()
  toast.add({
    title: 'Logged out',
    description: 'You have been successfully logged out.',
    color: 'success'
  })
}
</script>

<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your dashboard
        </p>
      </div>

      <!-- User Info Card -->
      <UCard class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              User Information
            </h2>
            <div class="mt-4 space-y-2">
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ user?.name || 'N/A' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ user?.email || 'N/A' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Username:</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ user?.username || 'N/A' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Role:</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ user?.role || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <UButton
            color="error"
            variant="outline"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="w-4 h-4 mr-2" />
            Logout
          </UButton>
        </div>
      </UCard>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard>
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-4">
              <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Customers
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage your customer relationships
            </p>
            <UButton
              to="/customers"
              color="primary"
              variant="outline"
              size="sm"
            >
              View Customers
            </UButton>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mb-4">
              <UIcon name="i-lucide-inbox" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Inbox
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Check your messages and notifications
            </p>
            <UButton
              to="/inbox"
              color="success"
              variant="outline"
              size="sm"
            >
              View Inbox
            </UButton>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mb-4">
              <UIcon name="i-lucide-settings" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Settings
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure your account preferences
            </p>
            <UButton
              to="/settings"
              color="info"
              variant="outline"
              size="sm"
            >
              View Settings
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template> 