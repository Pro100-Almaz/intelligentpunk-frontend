// Apply green primary color on login and signup pages; use gray elsewhere
import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  const appConfig = useAppConfig()
  const defaultPrimary = 'gray'

  if (to.path === '/login' || to.path === '/register') {
    appConfig.ui.colors.primary = 'green'
  } else {
    appConfig.ui.colors.primary = defaultPrimary
  }
})


