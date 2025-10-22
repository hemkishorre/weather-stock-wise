import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  product_name: string;
  price: number;
  unit: string;
  in_stock: boolean;
  description: string | null;
  wholesaler_id: string;
}

interface WholesalerWithProducts {
  wholesaler_id: string;
  wholesaler_email: string;
  products: Product[];
}

const WholesalerMarketplace = () => {
  const [wholesalers, setWholesalers] = useState<WholesalerWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('wholesaler_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Get unique wholesaler IDs
      const wholesalerIds = [...new Set(products?.map(p => p.wholesaler_id) || [])];
      
      // Group products by wholesaler
      const groupedWholesalers: WholesalerWithProducts[] = wholesalerIds.map((wholesalerId, index) => {
        const wholesalerProducts = products?.filter(p => p.wholesaler_id === wholesalerId) || [];
        return {
          wholesaler_id: wholesalerId,
          wholesaler_email: `Wholesaler ${index + 1}`,
          products: wholesalerProducts
        };
      });

      setWholesalers(groupedWholesalers);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedProduct || !quantity) {
      toast.error("Please enter quantity");
      return;
    }

    setIsOrdering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to place orders");
        return;
      }

      const quantityNum = parseFloat(quantity);
      const totalPrice = quantityNum * selectedProduct.price;

      const { error } = await supabase
        .from('vendor_orders')
        .insert({
          vendor_id: user.id,
          wholesaler_id: selectedProduct.wholesaler_id,
          product_id: selectedProduct.id,
          quantity: quantityNum,
          unit_price: selectedProduct.price,
          total_price: totalPrice,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success("Order placed successfully!");
      setSelectedProduct(null);
      setQuantity("");
      setNotes("");
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("Failed to place order");
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold">Wholesaler Marketplace</h2>
          <p className="text-muted-foreground">
            Browse and order products from wholesalers
          </p>
        </div>

        {wholesalers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {wholesalers.map((wholesaler) => (
              <Card key={wholesaler.wholesaler_id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-2xl">
                    {wholesaler.wholesaler_email}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {wholesaler.products.length} product{wholesaler.products.length !== 1 ? 's' : ''} available
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wholesaler.products.map((product) => (
                      <Card key={product.id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">{product.product_name}</CardTitle>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                            <span className="text-muted-foreground">/ {product.unit}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={product.in_stock ? "secondary" : "outline"}>
                              {product.in_stock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedProduct(product)}
                            disabled={!product.in_stock}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Order Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place Order</DialogTitle>
              <DialogDescription>
                Order {selectedProduct?.product_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Price per {selectedProduct?.unit}</Label>
                <p className="text-2xl font-bold text-primary">₹{selectedProduct?.price}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity ({selectedProduct?.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>
              {quantity && (
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <p className="text-2xl font-bold text-secondary">
                    ₹{(parseFloat(quantity) * (selectedProduct?.price || 0)).toFixed(2)}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any special instructions"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
              <Button onClick={handleOrder} disabled={isOrdering}>
                {isOrdering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default WholesalerMarketplace;
