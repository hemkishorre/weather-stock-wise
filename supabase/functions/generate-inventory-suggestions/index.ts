import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, vendorId } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const WEATHER_API_KEY = Deno.env.get('WEATHER_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !WEATHER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables are not set');
    }

    console.log('Generating suggestions for vendor:', vendorId, 'location:', location);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch vendor's inventory needs
    const { data: inventoryNeeds, error: inventoryError } = await supabase
      .from('vendor_inventory_needs')
      .select('*')
      .eq('vendor_id', vendorId);

    if (inventoryError) {
      console.error('Error fetching inventory needs:', inventoryError);
      throw inventoryError;
    }

    console.log('Fetched inventory needs:', inventoryNeeds);

    // Fetch weather forecast
    const weatherResponse = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&apikey=${WEATHER_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    const forecast = weatherData.timelines.daily.slice(0, 7).map((day: any) => {
      const values = day.values;
      const weatherCode = values.weatherCodeMax || values.weatherCodeMin || 0;
      
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
      };
    });

    console.log('Weather forecast:', forecast);

    // Prepare prompt for OpenAI
    const prompt = `You are an inventory management AI assistant for a vendor. Based on the following information, generate 4-6 actionable inventory suggestions:

Current Inventory Needs:
${inventoryNeeds.map(item => `- ${item.item_name}: ${item.quantity} ${item.unit} (Priority: ${item.priority})`).join('\n')}

7-Day Weather Forecast:
${forecast.map((day: any) => `- ${day.date}: ${day.temp}°C, ${day.condition}, ${day.humidity}% humidity`).join('\n')}

Consider:
1. Weather impact on product demand (hot weather = more cold drinks, cold weather = more hot items)
2. Product shelf life (perishables need more frequent small orders, non-perishables can be bulk ordered)
3. Current inventory levels and priorities
4. Seasonal demand patterns

For each suggestion, provide:
- item: The product name (use items from the vendor's existing inventory needs when relevant)
- currentStock: Current stock level (use 0 if new item)
- suggested: Recommended stock level
- reason: Brief explanation considering weather and shelf life (max 60 chars)
- trend: "up", "down", or "stable"
- priority: "high", "medium", or "low"

Return ONLY a JSON array of suggestions, no other text.`;

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert inventory management assistant. Always respond with valid JSON arrays only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const suggestionsText = openaiData.choices[0].message.content.trim();
    
    console.log('OpenAI response:', suggestionsText);

    // Parse the JSON response
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleanedText = suggestionsText.replace(/```json\n?|\n?```/g, '').trim();
      suggestions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse AI suggestions');
    }

    return new Response(
      JSON.stringify({ suggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-inventory-suggestions:', error);
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
