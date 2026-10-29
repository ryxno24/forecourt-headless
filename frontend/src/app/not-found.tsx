import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <p className="text-sm font-semibold tracking-widest text-muted uppercase">404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">The page you were looking for has moved or no longer exists.</p>
      <div className="mt-8">
        <Button link={{ label: "Back to the homepage", url: "/", newTab: false }} />
      </div>
    </Container>
  );
}
