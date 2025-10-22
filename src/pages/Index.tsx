import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WeatherCard from "@/components/WeatherCard";
import InventorySuggestions from "@/components/InventorySuggestions";
import WholesalerMarketplace from "@/components/WholesalerMarketplace";
import VendorInventory from "@/components/VendorInventory";
import WholesalerProducts from "@/components/WholesalerProducts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setUserRole(roleData?.role || null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {!user ? (
          <>
            <Hero />
          </>
        ) : userRole === 'vendor' ? (
          <>
            <WeatherCard />
            <VendorInventory />
            <InventorySuggestions />
            <WholesalerMarketplace />
          </>
        ) : userRole === 'wholesaler' ? (
          <>
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center space-y-4">
                <h1 className="text-4xl font-bold">Wholesaler Dashboard</h1>
                <p className="text-xl text-muted-foreground">
                  Manage your products and view vendor orders
                </p>
              </div>
            </div>
            <WholesalerProducts />
          </>
        ) : null}
      </main>
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 SupplySync. Helping vendors optimize inventory with weather intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
