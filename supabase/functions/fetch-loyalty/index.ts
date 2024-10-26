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

    // Fetch all loyalty rewards for the specific organization
    const { data: loyaltyRewardsData, error: loyaltyRewardsError } = await supabase
      .from('LoyaltyReward')
      .select('*') // Select all columns
      .eq('organizationId', organizationId);

    if (loyaltyRewardsError) {
      throw new Error(loyaltyRewardsError.message);
    }

    // Return the loyalty rewards data
    return new Response(JSON.stringify(loyaltyRewardsData), {
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
