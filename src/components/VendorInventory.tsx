import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Package, Loader2 } from "lucide-react";

interface InventoryNeed {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  priority: string;
  notes: string | null;
}

const VendorInventory = () => {
  const [needs, setNeeds] = useState<InventoryNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInventoryNeeds();
  }, []);

  const fetchInventoryNeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_inventory_needs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNeeds(data || []);
    } catch (error) {
      console.error('Error fetching inventory needs:', error);
      toast.error("Failed to load inventory needs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('vendor_inventory_needs')
        .insert({
          vendor_id: user.id,
          item_name: itemName,
          quantity: parseFloat(quantity),
          unit,
          priority,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success("Item added successfully!");
      setIsDialogOpen(false);
      resetForm();
      fetchInventoryNeeds();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendor_inventory_needs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Item removed");
      fetchInventoryNeeds();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Failed to remove item");
    }
  };

  const resetForm = () => {
    setItemName("");
    setQuantity("");
    setUnit("kg");
    setPriority("medium");
    setNotes("");
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

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Inventory Needs</h2>
            <p className="text-muted-foreground mt-1">
              Add items you need to order from wholesalers
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Inventory Need</DialogTitle>
                  <DialogDescription>
                    Specify what items you need to order
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item Name *</Label>
                    <Input
                      id="item-name"
                      placeholder="e.g., Fresh Tomatoes"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        placeholder="10"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit *</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger id="unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                          <SelectItem value="box">box</SelectItem>
                          <SelectItem value="case">case</SelectItem>
                          <SelectItem value="liter">liter</SelectItem>
                          <SelectItem value="pieces">pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Item"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {needs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                No items added yet. Click "Add Item" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {needs.map((need) => (
              <Card key={need.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{need.item_name}</CardTitle>
                      <CardDescription>
                        Quantity: {need.quantity} {need.unit}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(need.priority)}>
                        {need.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(need.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {need.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{need.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VendorInventory;
