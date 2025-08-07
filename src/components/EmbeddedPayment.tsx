import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Use your Stripe publishable key here (this is safe to expose)
const stripePromise = loadStripe("pk_test_51RqcQwBBb55hy3jU9L30IHx9w1sFZ4NoQngm6UwgwyiY1ZBF56QJ5DbeDxMxoHJwWEruoPbmmfrz27ClAS0qe3YO00S4yLN5Va");

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

  // Debug logging
  console.log("PaymentForm rendered", { stripe: !!stripe, elements: !!elements, clientSecret: !!clientSecret });

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
        // Process mixed payment (subscriptions + products)
        const { data, error } = await supabase.functions.invoke('process-mixed-payment', {
          body: {
            payment_intent_id: paymentIntent.id,
            customer_id: customerId
          }
        });

        if (error) throw error;

        toast({
          title: "Payment Successful!",
          description: "Your subscription and orders are now active.",
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
      <PaymentElement 
        options={{
          layout: "tabs"
        }}
      />
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
  products?: string[];
  regionalServices?: string[];
  userEmail: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  city?: string;
  country?: string;
  onSuccess: () => void;
  onBack: () => void;
}

const EmbeddedPayment = ({ plans, products = [], regionalServices = [], userEmail, firstName, lastName, password, phone, city, country, onSuccess, onBack }: EmbeddedPaymentProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch data from database for display
  const [planData, setPlanData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription plans
        if (plans.length > 0) {
          const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .in('id', plans);
          
          if (error) throw error;
          setPlanData(data || []);
        }

        // Fetch products
        if (products.length > 0) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', products);
          
          if (error) throw error;
          setProductData(data || []);
        }

        // Fetch regional services
        if (regionalServices.length > 0) {
          const { data, error } = await supabase
            .from('regional_services')
            .select('*')
            .in('id', regionalServices);
          
          if (error) throw error;
          setServiceData(data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [plans, products, regionalServices]);

  const subscriptionTotal = planData.reduce((sum, plan) => {
    return sum + parseFloat(plan.price.toString());
  }, 0) + serviceData.reduce((sum, service) => {
    return sum + parseFloat(service.price.toString());
  }, 0);

  const productTotal = productData.reduce((sum, product) => {
    return sum + parseFloat(product.price.toString());
  }, 0);

  const grandTotal = subscriptionTotal + productTotal;

  const initializePayment = async () => {
    console.log("Initializing payment...", { plans, products, regionalServices, userEmail, firstName, lastName });
    
    if ((!plans || plans.length === 0) && (!products || products.length === 0) && (!regionalServices || regionalServices.length === 0)) {
      console.error("No items provided to payment initialization");
      toast({
        title: "Error",
        description: "No items selected for payment. Please go back and select items.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('create-mixed-payment', {
        body: { 
          subscriptionPlans: plans, 
          products, 
          regionalServices,
          email: userEmail, 
          firstName, 
          lastName 
        }
      });

      console.log("Payment intent response:", { data, error });

      if (error) throw error;

      console.log("Setting client secret:", data.client_secret);
      setClientSecret(data.client_secret);
      setCustomerId(data.customer_id);
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize payment on component mount
  useEffect(() => {
    initializePayment();
  }, []);

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium">Customer Information:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span> {firstName} {lastName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {userEmail}
          </div>
          {phone && (
            <div>
              <span className="font-medium">Phone:</span> {phone}
            </div>
          )}
          {city && country && (
            <div>
              <span className="font-medium">Location:</span> {city}, {country}
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium">Order Summary:</h4>
        
        {/* Subscription Plans */}
        {planData.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-2">Monthly Subscriptions:</h5>
            <ul className="space-y-2">
              {planData.map(plan => (
                <li key={plan.id} className="flex justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-foreground">€{parseFloat(plan.price.toString()).toFixed(2)}/month</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Regional Services */}
        {serviceData.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-2">Regional Services:</h5>
            <ul className="space-y-2">
              {serviceData.map(service => (
                <li key={service.id} className="flex justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{service.name} ({service.region})</span>
                  <span className="text-foreground">€{parseFloat(service.price.toString()).toFixed(2)}/month</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Products */}
        {productData.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-2">Safety Products (One-time):</h5>
            <ul className="space-y-2">
              {productData.map(product => (
                <li key={product.id} className="flex justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-foreground">€{parseFloat(product.price.toString()).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Totals */}
        <div className="border-t pt-3 space-y-2">
          {subscriptionTotal > 0 && (
            <div className="flex justify-between text-base">
              <span>Monthly Subscription:</span>
              <span className="text-foreground">€{subscriptionTotal.toFixed(2)}/month</span>
            </div>
          )}
          {productTotal > 0 && (
            <div className="flex justify-between text-base">
              <span>One-time Products:</span>
              <span className="text-foreground">€{productTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total Payment:</span>
            <span className="text-foreground">€{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">💳 Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading payment form...</span>
            </div>
          ) : clientSecret ? (
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
          ) : (
            <div className="text-center p-4">
              <p className="text-destructive">Failed to load payment form</p>
              <Button onClick={initializePayment} className="mt-2">
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Testing Skip Button */}
      <Button 
        onClick={onSuccess} 
        variant="secondary" 
        className="w-full"
        size="lg"
      >
        Skip Payment (Testing Only)
      </Button>
      
      <Button variant="outline" onClick={onBack} className="w-full">
        Back to Plans
      </Button>
    </div>
  );
};

export default EmbeddedPayment;