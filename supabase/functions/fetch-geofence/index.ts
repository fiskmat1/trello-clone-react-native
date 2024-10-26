import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  try {
    // Parse the organization ID from the URL query params
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'Missing organization ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch geofence data for the specific organization
    const { data: geofenceData, error: geofenceError } = await supabase
      .from('Geofence')
      .select('latitude, longitude, radius') // Select necessary columns
      .eq('organizationId', organizationId)
      .single(); // Expect a single geofence entry

    if (geofenceError) {
      throw new Error(geofenceError.message);
    }

    // Return the geofence data
    return new Response(JSON.stringify(geofenceData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
