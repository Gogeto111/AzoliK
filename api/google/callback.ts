import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return res.redirect(`/?oauth_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return res.redirect("/?oauth_error=Missing code or state");
  }

  const [integrationId] = state.split("_");

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth not configured on server");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenResponse.json();

    // Get the session cookie / auth token from request
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Not authenticated");
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Get user's business ID
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();
    const businessId = userData?.businessId;

    if (businessId) {
      const bizRef = adminDb.collection("businesses").doc(businessId);
      const bizDoc = await bizRef.get();
      const integrations = bizDoc.data()?.integrations || {};

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

      await bizRef.update({ integrations, updatedAt: Date.now() });
    }

    return res.redirect(`/integrations?oauth_success=${integrationId}`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.redirect(`/?oauth_error=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`);
  }
}
