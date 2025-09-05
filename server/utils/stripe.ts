import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export const useStripe = (): Stripe => {
  if (!stripeInstance) {
    const config = useRuntimeConfig()
    const secretKey = config.stripeSecretKey
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-06-20', // Use latest API version
    })
  }

  return stripeInstance
}
