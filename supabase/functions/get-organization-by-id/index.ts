// supabase/functions/get-organization-by-id/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  try {
    // Parse the organization ID from the URL query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    console.log(`Fetching organization with id: ${id}`);
    console.log(`Supabase URL: ${supabaseUrl}`);

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing organization ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the organization data from the database
    const { data, error } = await supabase
      .from('Organization')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Return the organization data as JSON
    return new Response(JSON.stringify(data), {
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
