import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@1.30.0';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const appuserId = searchParams.get("appuserId");

  console.log("Received request for appuserId:", appuserId);

  if (!appuserId) {
    console.error("Error: appuserId is missing from request");
    return new Response("appuserId is required", { status: 400 });
  }

  try {
    console.log("Fetching organization IDs for appuserId:", appuserId);

    // Step 1: Get organization IDs for the specified appuserId
    const { data: loyaltyData, error: loyaltyError } = await supabaseClient
      .from("LoyaltyPoints")
      .select("organizationId, points")
      .eq("appuserId", appuserId);

    if (loyaltyError) {
      console.error("Error fetching data from LoyaltyPoints:", loyaltyError.message);
      return new Response(JSON.stringify({ error: loyaltyError.message }), { status: 500 });
    }

    if (!loyaltyData || loyaltyData.length === 0) {
      console.log("No organizations found for appuserId:", appuserId);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    console.log("Organization IDs retrieved:", loyaltyData);

    // Extract organization IDs and create a mapping of organizationId to points
    const organizationIds = loyaltyData.map((entry: any) => entry.organizationId);
    const pointsMap = Object.fromEntries(
      loyaltyData.map((entry: any) => [entry.organizationId, entry.points])
    );

    // Step 2: Fetch organization details for those organization IDs
    const { data: organizationData, error: organizationError } = await supabaseClient
      .from("Organization")
      .select("id, name, description, image, address, category")
      .in("id", organizationIds);

    if (organizationError) {
      console.error("Error fetching data from Organization:", organizationError.message);
      return new Response(JSON.stringify({ error: organizationError.message }), { status: 500 });
    }

    console.log("Organization data retrieved:", organizationData);

    // Step 3: Combine points with organization details
    const organizations = organizationData.map((org: any) => ({
      ...org,
      points: pointsMap[org.id],
    }));

    return new Response(JSON.stringify(organizations), { status: 200 });
  } catch (error) {
    console.error("Unexpected error occurred:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
