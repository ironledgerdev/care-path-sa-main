import * as Sentry from "@sentry/react";

const DSN = (import.meta as any).env?.VITE_SENTRY_DSN as string | undefined;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: (import.meta as any).env?.MODE || "development",
  });
}
