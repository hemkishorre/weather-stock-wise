import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  default: Cloud,
};

const WeatherCard = () => {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [location, setLocation] = useState<string>("London");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLocationAndFetchWeather();
  }, []);

  const loadLocationAndFetchWeather = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('vendor_preferences')
          .select('location')
          .eq('user_id', user.id)
          .single();
        
        if (data?.location) {
          setLocation(data.location);
          await fetchWeather(data.location);
          return;
        }
      }
      
      await fetchWeather("London");
    } catch (error) {
      console.error('Error loading preferences:', error);
      await fetchWeather("London");
    }
  };

  const fetchWeather = async (loc: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-weather', {
        body: { location: loc },
      });

      if (error) throw error;

      if (data && data.forecast) {
        setForecast(data.forecast);
        setLocation(data.location);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast.error("Failed to fetch weather data");
      setForecast([
        { temp: 24, condition: "sunny", humidity: 65, windSpeed: 12, precipitation: 10 },
        { temp: 22, condition: "cloudy", humidity: 72, windSpeed: 15, precipitation: 40 },
        { temp: 19, condition: "rainy", humidity: 85, windSpeed: 20, precipitation: 80 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = async () => {
    if (!newLocation.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('vendor_preferences')
          .upsert({ 
            user_id: user.id, 
            location: newLocation.trim() 
          });

        if (error) throw error;
      }

      await fetchWeather(newLocation.trim());
      setIsDialogOpen(false);
      toast.success("Location updated successfully!");
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error("Failed to update location");
    } finally {
      setIsSaving(false);
    }
  };

  const days = ["Today", "Tomorrow", "Day After"];

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
          <div className="text-center flex-1">
            <h2 className="text-3xl md:text-4xl font-bold">Weather Forecast - {location}</h2>
            <p className="text-muted-foreground">
              Plan your inventory based on upcoming weather conditions
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Change Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Location</DialogTitle>
                <DialogDescription>
                  Enter a city name to get weather forecasts for that location
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="location">City Name</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, New York, Tokyo"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLocationChange()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleLocationChange} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Location"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forecast.map((day, index) => {
            const IconComponent = weatherIcons[day.condition as keyof typeof weatherIcons] || weatherIcons.default;
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="gradient-sky pb-16">
                  <CardTitle className="text-primary-foreground text-center">
                    {days[index]}
                  </CardTitle>
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <IconComponent className="w-16 h-16 text-primary-foreground" />
                    <span className="text-5xl font-bold text-primary-foreground">
                      {day.temp}°C
                    </span>
                    <span className="text-sm text-primary-foreground/90 capitalize">
                      {day.condition}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Humidity</span>
                    </div>
                    <span className="font-semibold">{day.humidity}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Wind</span>
                    </div>
                    <span className="font-semibold">{day.windSpeed} km/h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Rain Chance</span>
                    </div>
                    <span className="font-semibold">{day.precipitation}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeatherCard;
