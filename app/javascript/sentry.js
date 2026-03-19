import * as Sentry from "@sentry/browser";

const dsn = document.querySelector('meta[name="sentry-dsn"]')?.content;

if (dsn) {
  Sentry.init({
    dsn,
    environment: document.querySelector('meta[name="rails-env"]')?.content,
    tracesSampleRate: 0.05,
    sendDefaultPii: false,
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
}

export default Sentry;
