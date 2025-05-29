import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/PurchaseCreditsModal.css';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import StripeProvider from './StripeProvider';

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
}

// This is the inner component that uses Stripe hooks
const PurchaseForm: React.FC<Omit<PurchaseCreditsModalProps, 'isOpen'>> = ({
  onClose,
  currentCredits
}) => {
  const { updateUserCredits } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  
  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  
  // Package options - customize as needed
  const creditPackages = [
    { id: "10credits", credits: 10, price: 2.99, popular: true, productId: "prod_SOhlgeRRAcipbG" },
    { id: "20credits", credits: 20, price: 5.50, popular: false },
    { id: "50credits", credits: 50, price: 12.99, popular: false }
  ];

  const [selectedPackage, setSelectedPackage] = useState(creditPackages[0]);

  // Add error boundary state for Stripe elements
  const [stripeElementError, setStripeElementError] = useState<string | null>(null);

  useEffect(() => {
    // Clear previous errors when component mounts
    setErrorMessage(null);
    setStripeElementError(null);
    
    // Add event listener for potential Stripe errors
    const handleStripeError = (event: ErrorEvent) => {
      if ((event.message && event.message.includes('Stripe')) || 
          (event.message && event.message.includes('message port closed'))) {
        console.log('Stripe error intercepted:', event.message);
        // Prevent error from bubbling up
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    window.addEventListener('error', handleStripeError);
    
    return () => {
      window.removeEventListener('error', handleStripeError);
    };
  }, []);

  const handlePurchase = async () => {
    if (!stripe || !elements) {
      // Stripe has not loaded yet
      setErrorMessage("Payment system is still loading. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Payment form not found. Please refresh and try again.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error("Not authenticated. Please log in.");
      }
      
      // Create payment intent on the server
      const intentResponse = await fetch(`${API_URL}/credits/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          packageId: "10credits" // Always use the 10 credits package
        })
      });
      
      if (!intentResponse.ok) {
        const errorData = await intentResponse.json().catch(() => null);
        throw new Error(
          errorData?.message || `Server error: ${intentResponse.status}`
        );
      }
      
      const { clientSecret, credits } = await intentResponse.json();
      
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });
      
      if (error) {
        throw new Error(error.message || "Payment failed. Please try again.");
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Payment succeeded, now update credits on our server
        const response = await fetch(`${API_URL}/credits/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            credits,
            amount: 2.99 // Fixed amount for 10 credits
          })
        });
        
        if (!response.ok) {
          throw new Error("Payment succeeded but failed to add credits. Please contact support.");
        }
        
        const data = await response.json();
        updateUserCredits(data.credits);
        setPurchaseSuccess(true);
        
        // Close modal after showing success message
        setTimeout(() => {
          onClose();
          setPurchaseSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error purchasing credits:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to purchase credits");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="credits-modal" onClick={e => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>×</button>
      
      {purchaseSuccess ? (
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Credits Added!</h2>
          <p>Your purchase was successful. Enjoy creating more vivid essays!</p>
        </div>
      ) : (
        <>
          <h2>Get More Credits</h2>
          <p className="credits-subtitle">Unlock the power to create more vivid essays</p>
          
          <div className="credits-promo-message">
            <span className="highlight">Special Offer:</span> 10 credits for only $2.99!
          </div>
          
          <div className="current-credits">
            <span>Your current balance: </span>
            <span className="credit-amount">{currentCredits} credits</span>
          </div>
          
          <div className="single-package">
            <div className="package-content">
              <h3>10 Credits</h3>
              <p className="price">$2.99</p>
              <p className="per-credit">Just $0.30 per credit</p>
            </div>
          </div>
          
          <div className="card-element-container">
            <label>Card Details</label>
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          <button 
            className="purchase-button" 
            onClick={handlePurchase}
            disabled={isProcessing || !stripe}
          >
            {isProcessing ? 'Processing...' : `Purchase 10 Credits for $2.99`}
          </button>
          
          <p className="terms-note">
            By purchasing credits, you agree to our <a href="#terms">Terms of Service</a>.
            Payments are processed securely through Stripe.
          </p>
        </>
      )}
    </div>
  );
};

// This is the wrapper component that provides the Stripe context
const PurchaseCreditsModal: React.FC<PurchaseCreditsModalProps> = (props) => {
  if (!props.isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={props.onClose}>
      <StripeProvider>
        <PurchaseForm onClose={props.onClose} currentCredits={props.currentCredits} />
      </StripeProvider>
    </div>
  );
};

export default PurchaseCreditsModal; 