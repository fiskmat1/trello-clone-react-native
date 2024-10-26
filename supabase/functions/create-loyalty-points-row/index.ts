import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  try {
    // Parse the appuserId and organizationId from the URL query parameters
    const { searchParams } = new URL(req.url);
    const appuserId = searchParams.get('appuserId');
    const organizationId = searchParams.get('organizationId');

    if (!appuserId || !organizationId) {
      console.error('Missing appuserId or organizationId');
      return new Response(JSON.stringify({ error: 'Missing appuserId or organizationId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if the user already has loyalty points for this organization
    const { data: existingRow, error: fetchError } = await supabase
      .from('LoyaltyPoints')
      .select('*')
      .eq('appuserId', appuserId)
      .eq('organizationId', organizationId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing loyalty points row:', fetchError);
      throw fetchError;
    }

    // If no existing row, create a new loyalty points row
    if (!existingRow) {
      console.log('No existing loyalty points row found, creating a new one...');
      const { data, error } = await supabase
        .from('LoyaltyPoints')
        .insert([{ appuserId, organizationId, points: 0 }]);

      if (error) {
        console.error('Error creating loyalty points entry:', error);
        throw new Error('Error creating loyalty points entry');
      }

      console.log('Loyalty points row created successfully', data);
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('User already joined the loyalty program');
    return new Response(JSON.stringify({ success: true, message: 'User already joined the loyalty program' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    let errorMessage = 'Unknown error occurred';

    // Check if error is an instance of Error and log it
    if (error instanceof Error) {
      console.error('Error:', error);
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
