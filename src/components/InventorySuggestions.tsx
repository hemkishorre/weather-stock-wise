import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface Suggestion {
  item: string;
  currentStock: number;
  suggested: number;
  reason: string;
  trend: "up" | "down" | "stable";
  priority: "high" | "medium" | "low";
}

const InventorySuggestions = () => {
  // Mock data - in production this would come from AI/API
  const suggestions: Suggestion[] = [
    {
      item: "Ice Cream",
      currentStock: 50,
      suggested: 120,
      reason: "Hot sunny weather expected - high demand predicted",
      trend: "up",
      priority: "high",
    },
    {
      item: "Hot Beverages",
      currentStock: 100,
      suggested: 60,
      reason: "Warm weather - reduced demand for hot drinks",
      trend: "down",
      priority: "medium",
    },
    {
      item: "Fresh Salads",
      currentStock: 40,
      suggested: 85,
      reason: "Sunny weather increases fresh food preference",
      trend: "up",
      priority: "high",
    },
    {
      item: "Soups",
      currentStock: 80,
      suggested: 80,
      reason: "Stable demand expected",
      trend: "stable",
      priority: "low",
    },
  ];

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
