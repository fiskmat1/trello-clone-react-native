import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';
import { Client } from 'https://deno.land/x/postgres@v0.14.2/mod.ts';  // Use 'pg' library to connect to Aiven's PostgreSQL

// Supabase details
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Aiven PostgreSQL connection
const aivenDbUrl = Deno.env.get('AIVEN_DATABASE_URL')!;
const pgClient = new Client({
  connectionString: aivenDbUrl,
  ssl: {
    rejectUnauthorized: false, // Ensure SSL is properly set up
  },
});

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Connect to Aiven database
    await pgClient.connect();

    // Fetch organization data from Aiven database
    const result = await pgClient.query('SELECT id, name, email, phone FROM "Organization"');

    const organizations = result.rows; // Get all rows returned by the query

    // Sync each organization to Supabase
    for (const org of organizations) {
      const { id, name, email, phone } = org;

      // Check if the organization already exists in Supabase
      const { data: existingOrg, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingOrg) {
        // Update organization if it exists
        await supabase
          .from('organizations')
          .update({ name, email, phone })
          .eq('id', id);
      } else {
        // Insert new organization if it doesn't exist
        await supabase.from('organizations').insert({ id, name, email, phone });
      }
    }

    await pgClient.end(); // Close connection to Aiven DB

    return new Response(JSON.stringify({ message: 'Sync successful' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error syncing organization:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
