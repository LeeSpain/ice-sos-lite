import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Use your Stripe publishable key here (this is safe to expose)
const stripePromise = loadStripe("pk_test_51RqcQwBBb55hy3jUdJKoKA7xHAFUBWz5Dz8tO3JKnhMGIwOFOgJ1nHb7bnhDcTFJxKqLxOJKqqEMRYx8qYOLYLUl00CiHdcYkH");

interface PaymentFormProps {
  clientSecret: string;
  customerId: string;
  plans: string[];
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm = ({ clientSecret, customerId, plans, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        // Create subscriptions after successful payment
        const { data, error } = await supabase.functions.invoke('create-subscriptions', {
          body: {
            payment_intent_id: paymentIntent.id,
            customer_id: customerId,
            plans: plans
          }
        });

        if (error) throw error;

        toast({
          title: "Payment Successful!",
          description: "Your subscription is now active.",
        });
        
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full bg-emergency hover:bg-emergency/90"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          "Complete Payment"
        )}
      </Button>
    </form>
  );
};

interface EmbeddedPaymentProps {
  plans: string[];
  onSuccess: () => void;
  onBack: () => void;
}

const EmbeddedPayment = ({ plans, onSuccess, onBack }: EmbeddedPaymentProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { plans }
      });

      if (error) throw error;

      setClientSecret(data.client_secret);
      setCustomerId(data.customer_id);
      setPaymentReady(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for display
  const planPricing = {
    personal: { name: "Personal Account", price: 1.99 },
    guardian: { name: "Guardian Wellness", price: 4.99 },
    family: { name: "Family Sharing", price: 0.99 },
    callcenter: { name: "Call Centre (Spain)", price: 24.99 }
  };

  const total = plans.reduce((sum, planId) => {
    const plan = planPricing[planId as keyof typeof planPricing];
    return sum + (plan?.price || 0);
  }, 0);

  if (!paymentReady) {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium">Order Summary:</h4>
          <div className="text-sm">
            <ul className="space-y-2">
              {plans.map(planId => {
                const plan = planPricing[planId as keyof typeof planPricing];
                return (
                  <li key={planId} className="flex justify-between p-2 bg-white rounded border">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-primary">€{plan.price}/month</span>
                  </li>
                );
              })}
            </ul>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Monthly:</span>
                <span className="text-primary">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back to Plans
          </Button>
          <Button 
            onClick={initializePayment} 
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Payment...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">💳 Secure Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                customerId={customerId}
                plans={plans}
                onSuccess={onSuccess}
                onError={(error) => {
                  console.error("Payment error:", error);
                }}
              />
            </Elements>
          )}
        </CardContent>
      </Card>
      
      <Button variant="outline" onClick={onBack} className="w-full">
        Back to Plans
      </Button>
    </div>
  );
};

export default EmbeddedPayment;