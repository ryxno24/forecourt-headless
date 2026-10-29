"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en-GB">
      <body>
        <title>Something went wrong | Forecourt</title>
        <main className="mx-auto max-w-2xl px-4 py-24">
          <h1 className="text-4xl font-extrabold tracking-tight">Sorry, something went wrong</h1>
          <p className="mt-4 text-lg text-muted">
            The site is having trouble right now. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-ink"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
