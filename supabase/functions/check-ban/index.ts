// Supabase Edge Function: check-ban
// Path: supabase/functions/check-ban/index.ts
// Triggered by: Supabase Auth Hook (e.g., Password Exchange or Pre Token Generation)
// Purpose: Checks if a user is banned in the 'profiles' table before allowing login/token generation.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts' // Using a potentially newer stable version
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Edge Function 'check-ban' initializing...");

// Define expected structure for profile check
interface ProfileStatus {
  is_banned: boolean | null;
}

serve(async (req: Request) => {
  console.log("Received request for check-ban hook");

  // --- Environment Variable Check ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(
      JSON.stringify({ error: 'Function configuration error: Missing environment variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // --- Supabase Client Initialization ---
  const supabaseAdminClient: SupabaseClient = createClient(
    supabaseUrl,
    serviceRoleKey
  );
  console.log("Supabase admin client initialized.");

  try {
    // --- Extract User ID from Hook Payload ---
    const payload = await req.json();
    console.log("DEBUG: Hook Payload received:", JSON.stringify(payload)); // Keep for debugging if needed

    // --- CORRECTED User ID Extraction ---
    // Use payload.user_id directly, or fallback to payload.claims.sub
    const userId = payload?.user_id || payload?.claims?.sub;

    if (!userId) {
      // Log the actual payload if extraction fails
      console.error("User ID could not be extracted from payload:", JSON.stringify(payload));
      return new Response(
        JSON.stringify({ error: 'Auth hook error: User ID extraction failed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate if userId looks like a UUID (optional but good practice)
    if (typeof userId !== 'string' || userId.length !== 36) {
        console.error("Extracted userId does not appear to be a valid UUID:", userId);
         return new Response(
            JSON.stringify({ error: 'Auth hook error: Invalid User ID format.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }


    console.log(`Checking ban status for user ID: ${userId}`);

    // --- Query Profiles Table ---
    const { data: profile, error } = await supabaseAdminClient
      .from('profiles')
      .select('is_banned') // Only select the needed column
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to handle cases where profile might not exist yet

    // Handle Database Errors (excluding 'row not found')
    if (error && error.code !== 'PGRST116') { // PGRST116 = Row not found
      console.error(`Database error fetching profile for user ${userId}:`, error);
      console.warn(`Proceeding for user ${userId} despite profile fetch error.`);
      // Allow login on DB error for now to avoid blocking users unnecessarily
      // You might change this behavior based on your security policy
    }

    // --- Check Ban Status ---
    const typedProfile = profile as ProfileStatus | null;
    if (typedProfile?.is_banned === true) {
      console.log(`User ${userId} is BANNED. Denying access.`);
      // Return a specific error that Supabase Auth understands to deny access
      return new Response(
        JSON.stringify({
          error: 'user_banned', // Custom error identifier
          message: 'هذا الحساب محظور. الرجاء التواصل مع الإدارة.' // Message shown to the user
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } } // 403 Forbidden
      );
    }

    // --- User is NOT Banned (or profile doesn't exist/error occurred during fetch) ---
    console.log(`User ${userId} is allowed (not banned or profile check issue).`);
    // Return a successful response to allow the auth flow to continue.
   // Inside check-ban/index.ts when user is NOT banned
return new Response(
  JSON.stringify({ message: 'User check passed.' }), // Or an empty body: {}
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);

  } catch (e) {
    console.error("Critical error processing check-ban request:", e);
    // Log the request potentially for more context, be careful with sensitive data
    // console.error("Request causing error:", req);
    return new Response(
      JSON.stringify({ error: 'Internal server error processing auth hook.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})

console.log("Edge Function 'check-ban' finished initializing (server started)."); // Log server start