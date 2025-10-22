import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Suggestion {
  item: string;
  currentStock: number;
  suggested: number;
  reason: string;
  trend: "up" | "down" | "stable";
  priority: "high" | "medium" | "low";
}

const InventorySuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user location
      const { data: preferences } = await supabase
        .from('vendor_preferences')
        .select('location')
        .eq('user_id', user.id)
        .single();

      const location = preferences?.location || 'London';

      // Call edge function to generate suggestions
      const { data, error } = await supabase.functions.invoke('generate-inventory-suggestions', {
        body: { 
          location,
          vendorId: user.id 
        }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory suggestions",
        variant: "destructive",
      });
      // Set fallback suggestions on error
      setSuggestions([
        {
          item: "Ice Cream",
          currentStock: 50,
          suggested: 120,
          reason: "Hot weather expected - high demand",
          trend: "up",
          priority: "high",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-secondary";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">AI-Powered Insights</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold pt-2">Smart Inventory Suggestions</h2>
          <p className="text-muted-foreground">
            Optimize your stock based on weather forecasts and demand patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{suggestion.item}</CardTitle>
                    <CardDescription>{suggestion.reason}</CardDescription>
                  </div>
                  <Badge className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold">{suggestion.currentStock}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className={`flex items-center gap-1 ${getTrendColor(suggestion.trend)}`}>
                      {getTrendIcon(suggestion.trend)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Suggested</p>
                    <p className="text-2xl font-bold text-primary">{suggestion.suggested}</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full" variant={suggestion.trend === "up" ? "secondary" : "outline"}>
                    {suggestion.trend === "up" ? "Order More" : "View Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InventorySuggestions;
