import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  const { data, error } = await supabase.from('Organization').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch organizations' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
