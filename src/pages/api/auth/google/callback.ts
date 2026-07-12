import { getSupabase } from "@/lib/supabase";

// Google OAuth callback handler
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(
      `<html><body><script>window.opener.postMessage({error: "${error}"}, "*"); window.close();</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code || !state) {
    return new Response(
      `<html><body><script>window.opener.postMessage({error: "Missing code or state"}, "*"); window.close();</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Parse state: integrationId_timestamp_random
  const [integrationId] = state.split("_");

  try {
    // Exchange code for tokens
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/auth/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenResponse.json();

    // Store tokens in Supabase
    const sb = getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    
    if (user) {
      const { data: profile } = await sb
        .from("user_profiles")
        .select("business_id")
        .eq("auth_user_id", user.id)
        .single();

      if (profile?.business_id) {
        const { data: business } = await sb
          .from("businesses")
          .select("integrations")
          .eq("id", profile.business_id)
          .single();

        const integrations = business?.integrations || {};
        integrations[integrationId] = {
          connected: true,
          config: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
          },
          last_sync: new Date().toISOString(),
          status: "connected",
        };

        await sb
          .from("businesses")
          .update({ integrations, updated_at: new Date().toISOString() })
          .eq("id", profile.business_id);
      }
    }

    return new Response(
      `<html><body><script>window.opener.postMessage({success: true, integration: "${integrationId}"}, "*"); window.close();</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return new Response(
      `<html><body><script>window.opener.postMessage({error: "${err instanceof Error ? err.message : 'Unknown error'}"}, "*"); window.close();</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}