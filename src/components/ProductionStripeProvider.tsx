import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Production Stripe Configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QUaomPQPL7JslHG6VAE0rQT1eBYGqb0LFbOYYDLrVFtpELGClg3GbF4IlqXw3WKp9CuNKQQJMfhCWyZOt5P8qev00qZQo0cDV';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface ProductionStripeProviderProps {
  children: React.ReactNode;
}

export const ProductionStripeProvider: React.FC<ProductionStripeProviderProps> = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};