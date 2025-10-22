import { Button } from "@/components/ui/button";
import { Cloud, TrendingUp, Package, Bell } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
const Hero = () => {
  const navigate = useNavigate();
  return <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }} />
      
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border shadow-sm">
            <Cloud className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Smart Weather-Based Inventory</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Optimize Your Supply
            <br />
            <span className="gradient-hero bg-clip-text text-slate-950">
              With Weather Intelligence
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Help food vendors reduce waste and maximize profits with AI-powered inventory 
            recommendations based on real-time weather forecasts.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg" className="min-w-[200px]" onClick={() => navigate("/auth")}>
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px]" onClick={() => window.scrollTo({
            top: 800,
            behavior: 'smooth'
          })}>
              View Demo
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/60 backdrop-blur-sm border shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 rounded-lg gradient-sky flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Smart Predictions</h3>
              <p className="text-sm text-muted-foreground text-center">
                AI-driven forecasts based on weather patterns
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/60 backdrop-blur-sm border shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 rounded-lg gradient-fresh flex items-center justify-center">
                <Package className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Wholesaler Network</h3>
              <p className="text-sm text-muted-foreground text-center">
                Connect with local suppliers instantly
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/60 backdrop-blur-sm border shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Real-time Alerts</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get notified of weather impacts and stock suggestions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;