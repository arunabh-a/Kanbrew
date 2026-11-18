import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import routes from "./app.js";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

const app = new Hono();

// Canonical source of truth for "who can talk to the API" (CORS + CSRF).
// A related but *separate* allow-list — which origins may message the
// extension directly via chrome.runtime — lives in
// apps/app/public/manifest.json's `externally_connectable.matches` (see the
// note at the top of apps/app/public/background.js). Keep the two roughly in
// sync when adding/removing a production domain, but they don't have to be
// identical: this list is deliberately broader (e.g. it includes the bare
// `tabenspace.com` apex and the `chrome-extension://` origin itself, neither
// of which the extension's externally_connectable list needs).
const allowedOrigins = [
    'https://yohaku.crohent.com'
];

app.use('*', cors({
  origin: (origin) => {
    // Allow known origins, localhost dev servers
    if (!origin) return '*';
    if (allowedOrigins.includes(origin)) return origin;
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) return origin;
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Cache-Control', 'user-id', 'Authorization'],
  credentials: true,
}))

app.use('*', csrf({
  origin: (origin) => {
    if (!origin) return true; // Let missing origin through for non-browser clients (if any) or handle via cors
    if (allowedOrigins.includes(origin)) return true;
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) return true;
    return false;
  }
}))


app.get("/", (c) => {
    const code = c.req.query("code");
    const frontendUrl = process.env.FRONTEND_URL ;
    
    if (code) {
        // Supabase fell back to Site URL, forward the PKCE code to the frontend auth route
        return c.redirect(`${frontendUrl}/auth?type=email_confirmation&code=${encodeURIComponent(code)}`);
    }

    return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Yohaku Server v1</title>
            <style>
                body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #000; color: #fff; }
            </style>
        </head>
        <body>
            <div id="message">Yohaku Server v1 is running</div>
        </body>
        </html>
    `);
});

app.route("/", routes);

const port = Number(process.env.PORT) || 4000;

serve(
    {
        fetch: app.fetch,
        port,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
