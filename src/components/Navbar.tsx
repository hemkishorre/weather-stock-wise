import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero" />
            <span className="text-xl font-bold">SupplySync</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Inventory
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Wholesalers
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Analytics
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                3
              </Badge>
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline">Sign In</Button>
              <Button variant="hero">Get Started</Button>
            </div>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
