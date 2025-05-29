import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with configuration to handle potential messaging errors
const initializeStripe = async (): Promise<Stripe | null> => {
  try {
    const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
    if (!stripeKey) {
      console.error('Stripe key is missing');
      return null;
    }
    
    // Load Stripe without beta flags
    const stripe = await loadStripe(stripeKey);
    return stripe;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export default initializeStripe; 