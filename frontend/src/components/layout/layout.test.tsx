import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { page, settings } from "@/components/sections/test-utils";
import { buildNav } from "@/lib/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { StickyCta } from "./StickyCta";

describe("Header", () => {
  it("renders anchor navigation, a click to call link and the header CTA", () => {
    render(<Header settings={settings} nav={buildNav(page.sections, settings.siteName)} />);

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.querySelectorAll("a")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /0161 496 0000/ })).toHaveAttribute("href", "tel:01614960000");
    expect(screen.getByRole("link", { name: "Get my valuation" })).toHaveAttribute("href", "#contact");
  });

  it("omits the phone link when no phone number is set", () => {
    render(<Header settings={{ ...settings, phone: null }} nav={[]} />);

    expect(screen.queryByRole("link", { name: /call/i })).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

describe("Footer", () => {
  it("shows contact details and the footer text", () => {
    render(<Footer settings={settings} />);

    expect(screen.getByRole("link", { name: "hello@forecourt.example" })).toHaveAttribute(
      "href",
      "mailto:hello@forecourt.example",
    );
    expect(screen.getByText(/fictional business/)).toBeInTheDocument();
  });
});

describe("StickyCta", () => {
  it("hides once the target section is in view", () => {
    let notify: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: typeof notify) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    document.body.insertAdjacentHTML("beforeend", '<section id="contact"></section>');

    render(<StickyCta link={{ label: "Get my valuation", url: "#contact", newTab: false }} targetId="contact" />);
    const link = screen.getByRole("link", { name: "Get my valuation" });
    expect(link.closest("[inert]")).toBeNull();

    act(() => notify([{ isIntersecting: true }]));

    expect(link.closest("[inert]")).not.toBeNull();
    document.getElementById("contact")?.remove();
  });
});
