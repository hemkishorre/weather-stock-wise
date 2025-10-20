import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location = 'London' } = await req.json();
    const apiKey = Deno.env.get('WEATHER_API_KEY');

    if (!apiKey) {
      throw new Error('Weather API key not configured');
    }

    console.log('Fetching weather for location:', location);

    // Fetch current weather and 3-day forecast from WeatherAPI.com
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error:', response.status, errorText);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather data fetched successfully');

    // Transform the data to match our frontend format
    const forecast = data.forecast.forecastday.map((day: any) => ({
      date: day.date,
      temp: Math.round(day.day.avgtemp_c),
      condition: day.day.condition.text.toLowerCase().includes('rain') ? 'rainy' :
                 day.day.condition.text.toLowerCase().includes('cloud') ? 'cloudy' : 'sunny',
      humidity: day.day.avghumidity,
      windSpeed: Math.round(day.day.maxwind_kph),
      precipitation: day.day.daily_chance_of_rain,
      icon: day.day.condition.icon,
    }));

    return new Response(
      JSON.stringify({
        location: data.location.name,
        forecast,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-weather function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
