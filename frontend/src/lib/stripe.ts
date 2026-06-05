import { loadStripe, Stripe } from '@stripe/stripe-js';

// loadStripe is called once and cached — calling it multiple times is safe
// because Stripe.js deduplicates the load automatically.
let stripePromise: Promise<Stripe | null>;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in .env.local');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}