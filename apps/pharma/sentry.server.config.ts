// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://c116ec533535b9117345233aaa3814d5@o4510307099279360.ingest.de.sentry.io/4510307121102928",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.VERCEL_ENV || "development",

  beforeSend(event, hint) {
    // Don't send errors from development/localhost
    if (process.env.NODE_ENV === "development") {
      console.error("Sentry event (not sent in dev):", event);
      return null;
    }
    return event;
  },

  // Ignore health check and monitoring routes
  ignoreTransactions: ["/api/health", "/api/frameworks/info"],
});

