import { Button } from "@/components/ui/button";
import { Bell, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Order {
  id: string;
  status: string;
  quantity: number;
  total_price: number;
  created_at: string;
  product_id: string;
  wholesaler_products?: {
    product_name: string;
  };
}

const NotificationDropdown = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to order changes
    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_orders'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setUserRole(roleData?.role || null);

      // Fetch orders based on role
      let query = supabase
        .from('vendor_orders')
        .select(`
          *,
          wholesaler_products(product_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (roleData?.role === 'vendor') {
        query = query.eq('vendor_id', user.id);
      } else if (roleData?.role === 'wholesaler') {
        query = query.eq('wholesaler_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOrders(data || []);
      
      // Count pending orders as unread
      const pendingCount = (data || []).filter(o => o.status === 'pending').length;
      setUnreadCount(pendingCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            orders.map((order) => (
              <DropdownMenuItem key={order.id} className="flex flex-col items-start p-4 cursor-pointer">
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(order.status)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userRole === 'vendor' ? 'Order' : 'New Order'} - {order.wholesaler_products?.product_name || 'Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {order.quantity} • ₹{order.total_price}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Status: {order.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
