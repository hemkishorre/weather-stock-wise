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

    // Fetch weather forecast from Tomorrow.io API
    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&apikey=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tomorrow.io API error:', response.status, errorText);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather data fetched successfully');

    // Transform the data to match our frontend format
    const forecast = data.timelines.daily.slice(0, 3).map((day: any) => {
      const values = day.values;
      const weatherCode = values.weatherCodeMax || values.weatherCodeMin || 0;
      
      // Map Tomorrow.io weather codes to conditions
      let condition = 'sunny';
      if (weatherCode >= 4000 && weatherCode < 5000) {
        condition = 'rainy';
      } else if (weatherCode >= 1000 && weatherCode < 2000) {
        condition = 'cloudy';
      }
      
      return {
        date: day.time.split('T')[0],
        temp: Math.round(values.temperatureAvg),
        condition,
        humidity: Math.round(values.humidityAvg),
        windSpeed: Math.round(values.windSpeedAvg),
        precipitation: Math.round(values.precipitationProbabilityAvg || 0),
      };
    });

    return new Response(
      JSON.stringify({
        location: location,
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
