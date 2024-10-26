import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  try {
    // Parse the organization ID and appuser ID from the URL query params
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('id');
    const appuserId = searchParams.get('appuserId');

    if (!organizationId || !appuserId) {
      return new Response(JSON.stringify({ error: 'Missing organization ID or appuser ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the organization data from the database
    const { data: organizationData, error: organizationError } = await supabase
      .from('Organization')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (organizationError) {
      throw new Error(organizationError.message);
    }

    // Fetch the loyalty points for the specific user and organization
    const { data: loyaltyPointsData, error: loyaltyPointsError } = await supabase
      .from('LoyaltyPoints')
      .select('points')
      .eq('appuserId', appuserId)
      .eq('organizationId', organizationId)
      .single();

    // Handle case where no loyalty points row exists
    let loyaltyPoints = null; // Default to 0 if no points exist

    if (loyaltyPointsError && loyaltyPointsError.code !== 'PGRST116') {
      // Log other potential errors
      throw new Error(loyaltyPointsError.message);
    }

    if (loyaltyPointsData) {
      loyaltyPoints = loyaltyPointsData.points;
    }

    // Return the organization data along with loyalty points
    const responseData = {
      ...organizationData,
      loyaltyPoints, // Use the default 0 or the fetched points
    };

    return new Response(JSON.stringify(responseData), {
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
