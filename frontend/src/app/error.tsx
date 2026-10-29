"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 sm:py-32">
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Sorry, something went wrong</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        We could not load this page. Please try again, or call us on the number at the top of the page and one of our
        buyers will help.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-brand px-6 font-semibold text-ink hover:bg-brand-strong"
      >
        Try again
      </button>
    </Container>
  );
}
