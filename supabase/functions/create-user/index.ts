import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';
import { Webhook } from "https://cdn.jsdelivr.net/npm/svix@1.38.1-next-acd2f7c5954a08cf1000310eebeffbb6863e4590.0/+esm";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('CLERK_SIGNING_SECRET')!; // Clerk's webhook signing secret

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Extract headers
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  // Check for missing headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Parse the request body
  const payload = await req.text(); // This will give the raw string body
  let evt;

  // Create a new Webhook instance with your secret.
  const webhook = new Webhook(webhookSecret);

  // Verify the signature
  try {
    evt = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid signature', { status: 403 });
  }

  // Process the webhook event (this example assumes a Clerk user.created event)
  const { id, email_addresses, first_name } = evt.data;
  const email = email_addresses[0].email_address;

  try {
    // Insert the user data into Supabase
    const { data, error } = await supabase
      .from('Appuser')
      .insert({ id, email, name: first_name });
  
    // Log both data and error
    console.log('Supabase insert result:', { data, error });
  
    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(JSON.stringify(error), { status: 400 });
    }
  
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
