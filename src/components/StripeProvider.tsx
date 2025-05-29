import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import initializeStripe from '../config/stripe';
import type { Stripe } from '@stripe/stripe-js';

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStripe = async () => {
      try {
        const stripe = await initializeStripe();
        setStripeInstance(stripe);
      } catch (err) {
        console.error('Error loading Stripe:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStripe();
  }, []);

  // Options to prevent Stripe-related errors
  const stripeOptions = {
    // This helps with iframe communication
    clientSecret: undefined,
    loader: 'auto' as const,
    locale: 'en' as const, // Force English language for all Stripe elements
  };

  if (loading) {
    return <div>Loading payment system...</div>;
  }

  return (
    <Elements stripe={stripeInstance} options={stripeOptions}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 