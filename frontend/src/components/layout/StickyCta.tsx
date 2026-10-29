"use client";

import { useEffect, useState } from "react";
import type { Link } from "@/lib/schemas";

export function StickyCta({ link, targetId }: { link: Link; targetId: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);

    if (!target || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "0px 0px -15% 0px",
    });
    observer.observe(target);

    return () => observer.disconnect();
  }, [targetId]);

  return (
    <div
      inert={hidden}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 motion-reduce:transition-none md:hidden ${hidden ? "translate-y-full" : ""}`}
    >
      <a
        href={link.url}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-ink"
      >
        {link.label}
      </a>
    </div>
  );
}
