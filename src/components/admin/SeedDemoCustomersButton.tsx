import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2 } from "lucide-react";

export const SeedDemoCustomersButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-customers');
      
      if (error) throw error;
      
      if (data.success) {
        const successCount = data.results.filter((r: any) => r.status === 'success').length;
        toast({
          title: "Demo Customers Created",
          description: `Successfully created ${successCount} demo customers with full subscriptions`,
        });
      } else {
        throw new Error('Failed to create demo customers');
      }
    } catch (error: any) {
      console.error('Error seeding customers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed demo customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Users className="mr-2 h-4 w-4" />
          Seed 5 Demo Customers
        </>
      )}
    </Button>
  );
};
