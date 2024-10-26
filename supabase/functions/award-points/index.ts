import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  try {
    // Parse the appuserId, organizationId, and pointsToAdd from the URL search parameters
    const { searchParams } = new URL(req.url);
    const appuserId = searchParams.get('appuserId');
    const organizationId = searchParams.get('organizationId');
    const pointsToAdd = parseInt(searchParams.get('pointsToAdd') || '0');

    // Check if required params are present
    if (!appuserId || !organizationId || !pointsToAdd) {
      return new Response(JSON.stringify({ error: 'Missing appuserId, organizationId, or pointsToAdd' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the current loyalty points for the user and organization
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('LoyaltyPoints')
      .select('points')
      .eq('appuserId', appuserId)
      .eq('organizationId', organizationId)
      .single();

    if (loyaltyError) {
      throw new Error(loyaltyError.message);
    }

    const currentPoints = loyaltyData ? loyaltyData.points : 0;

    // Add the points
    const newPoints = currentPoints + pointsToAdd;

    // Update the user's points in the database
    const { error: updateError } = await supabase
      .from('LoyaltyPoints')
      .upsert({ appuserId, organizationId, points: newPoints }, { onConflict: ['appuserId', 'organizationId'] });

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Return success response
    return new Response(JSON.stringify({ success: true, newPoints }), {
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
