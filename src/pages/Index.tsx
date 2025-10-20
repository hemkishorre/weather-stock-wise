import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WeatherCard from "@/components/WeatherCard";
import InventorySuggestions from "@/components/InventorySuggestions";
import WholesalerMarketplace from "@/components/WholesalerMarketplace";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <WeatherCard />
        <InventorySuggestions />
        <WholesalerMarketplace />
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
