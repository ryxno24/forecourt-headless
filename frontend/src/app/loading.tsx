import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="grid gap-10 py-12 sm:py-20 lg:grid-cols-2">
      <div className="space-y-5 motion-safe:animate-pulse">
        <div className="h-4 w-40 rounded bg-line" />
        <div className="h-14 w-full rounded bg-line" />
        <div className="h-14 w-3/4 rounded bg-line" />
        <div className="h-6 w-full rounded bg-line" />
        <div className="h-12 w-56 rounded-full bg-line" />
      </div>
      <div className="aspect-[4/3] rounded-3xl bg-line motion-safe:animate-pulse" />
      <span className="sr-only">Loading</span>
    </Container>
  );
}
