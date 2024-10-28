import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://deno.land/x/supabase@1.0.0/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Function to send a push notification via the Expo Push API
async function sendPushNotification(to: string, title: string, body: string) {
  const message = {
    to,
    sound: "default",
    title,
    body,
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    console.error("Failed to send push notification:", await response.text());
  }
}

serve(async (req) => {
  const today = new Date().toISOString().split("T")[0];

  // Fetch users who have not been notified today
  const { data: appusers, error: usersError } = await supabaseClient
    .from("Appuser")
    .select("id, expoPushToken, loyaltyPoints(id, organizationId, points, organization(name))")
    .not("id", "in", `SELECT appuserId FROM DailyNotifications WHERE lastNotified::DATE = '${today}'`);

  if (usersError) {
    console.error("Error fetching appusers:", usersError);
    return new Response("Error fetching users", { status: 500 });
  }

  for (const appuser of appusers) {
    if (!appuser.expoPushToken) continue; // Skip if the user doesn't have a push token

    // Loop through each organization where the user has loyalty points
    for (const loyalty of appuser.loyaltyPoints) {
      const { organizationId, points, organization } = loyalty;

      // Fetch rewards available in this organization where the points match/exceed the requirement
      const { data: rewards, error: rewardsError } = await supabaseClient
        .from("LoyaltyReward")
        .select("id, title, pointsRequired")
        .eq("organizationId", organizationId)
        .lte("pointsRequired", points)
        .limit(1); // Limit to 1 reward to avoid multiple notifications

      if (rewardsError) {
        console.error(`Error fetching rewards for organization ${organizationId}:`, rewardsError);
        continue;
      }

      if (rewards && rewards.length > 0) {
        const reward = rewards[0];
        
        // Send push notification
        await sendPushNotification(
          appuser.expoPushToken,
          "🎉 Reward Available!",
          `You have enough points for "${reward.title}" at ${organization.name}. Redeem it now!`
        );

        // Record notification in the `DailyNotifications` table
        const { error: insertError } = await supabaseClient
          .from("DailyNotifications")
          .insert({
            appuserId: appuser.id,
            lastNotified: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Error logging notification for user ${appuser.id}:`, insertError);
        }

        break; // Only notify once per user per day for the first matching reward
      }
    }
  }

  return new Response("Notifications processed", { status: 200 });
});
