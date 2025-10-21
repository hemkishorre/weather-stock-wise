import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  product_name: string;
  price: number;
  unit: string;
  in_stock: boolean;
  description: string | null;
}

const WholesalerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    unit: "",
    in_stock: true,
    description: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('wholesaler_products')
        .select('*')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.product_name || !formData.price || !formData.unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in");
        return;
      }

      const productData = {
        product_name: formData.product_name,
        price: parseFloat(formData.price),
        unit: formData.unit,
        in_stock: formData.in_stock,
        description: formData.description || null,
        wholesaler_id: user.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('wholesaler_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        const { error } = await supabase
          .from('wholesaler_products')
          .insert(productData);

        if (error) throw error;
        toast.success("Product added successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from('wholesaler_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Failed to delete product");
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      price: product.price.toString(),
      unit: product.unit,
      in_stock: product.in_stock,
      description: product.description || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      price: "",
      unit: "",
      in_stock: true,
      description: "",
    });
    setEditingProduct(null);
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">My Products</h2>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product details" : "Add a new product to your catalog"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    placeholder="e.g., Fresh Tomatoes"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., kg, box, liter"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Product description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in_stock">In Stock</Label>
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? "Update" : "Add Product"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No products added yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{product.product_name}</CardTitle>
                  {product.description && (
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                    <span className="text-muted-foreground">/ {product.unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${product.in_stock ? 'text-secondary' : 'text-muted-foreground'}`}>
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WholesalerProducts;
