import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-weather', {
        body: { location },
      });

      if (error) throw error;

      if (data && data.forecast) {
        setForecast(data.forecast);
        setLocation(data.location);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast.error("Failed to fetch weather data");
      // Fallback to mock data
      setForecast([
        { temp: 24, condition: "sunny", humidity: 65, windSpeed: 12, precipitation: 10 },
        { temp: 22, condition: "cloudy", humidity: 72, windSpeed: 15, precipitation: 40 },
        { temp: 19, condition: "rainy", humidity: 85, windSpeed: 20, precipitation: 80 },
      ]);
    } finally {
      setIsLoading(false);
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
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold">Weather Forecast - {location}</h2>
          <p className="text-muted-foreground">
            Plan your inventory based on upcoming weather conditions
          </p>
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
