import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Package } from "lucide-react";

interface Wholesaler {
  name: string;
  distance: number;
  rating: number;
  deliveryTime: string;
  items: { name: string; price: number; inStock: boolean }[];
  verified: boolean;
}

const WholesalerMarketplace = () => {
  // Mock data - in production this would come from an API
  const wholesalers: Wholesaler[] = [
    {
      name: "Fresh Produce Co.",
      distance: 2.3,
      rating: 4.8,
      deliveryTime: "30-45 min",
      items: [
        { name: "Ice Cream (box)", price: 45, inStock: true },
        { name: "Fresh Salads (kg)", price: 120, inStock: true },
        { name: "Beverages (case)", price: 85, inStock: true },
      ],
      verified: true,
    },
    {
      name: "City Food Suppliers",
      distance: 3.7,
      rating: 4.6,
      deliveryTime: "45-60 min",
      items: [
        { name: "Ice Cream (box)", price: 42, inStock: true },
        { name: "Fresh Salads (kg)", price: 115, inStock: false },
        { name: "Soups (liter)", price: 65, inStock: true },
      ],
      verified: true,
    },
    {
      name: "Quality Wholesale Market",
      distance: 5.1,
      rating: 4.7,
      deliveryTime: "60-75 min",
      items: [
        { name: "Ice Cream (box)", price: 48, inStock: true },
        { name: "Hot Beverages (kg)", price: 95, inStock: true },
        { name: "Fresh Salads (kg)", price: 125, inStock: true },
      ],
      verified: false,
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold">Wholesaler Marketplace</h2>
          <p className="text-muted-foreground">
            Compare prices and delivery times from nearby suppliers
          </p>
        </div>

        <div className="space-y-6">
          {wholesalers.map((wholesaler, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{wholesaler.name}</CardTitle>
                      {wholesaler.verified && (
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{wholesaler.distance} km away</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{wholesaler.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-accent" />
                        <span className="font-medium">{wholesaler.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="lg">
                    Contact Supplier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>Available Products</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wholesaler.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-2xl font-bold text-primary">₹{item.price}</p>
                        </div>
                        <Badge
                          variant={item.inStock ? "secondary" : "outline"}
                          className={item.inStock ? "" : "opacity-50"}
                        >
                          {item.inStock ? "In Stock" : "Out"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WholesalerMarketplace;
