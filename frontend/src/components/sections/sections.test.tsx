import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Cards } from "./Cards";
import { Contact } from "./Contact";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import { TextImage } from "./TextImage";
import { fixtureSection, settings } from "./test-utils";

vi.mock("@/actions/enquiry", () => ({ submitEnquiry: async () => ({ status: "idle" }) }));

describe("Hero", () => {
  it("renders the heading as the page h1 with the image", () => {
    render(<Hero section={fixtureSection("hero")} settings={settings} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sell your car in 24 hours");
    expect(screen.getByRole("img")).toHaveAttribute("alt", expect.stringContaining("Blue hatchback"));
  });

  it("renders heading and no img when the image is missing", () => {
    render(<Hero section={fixtureSection("hero", { image: null })} settings={settings} />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows the review rating from settings", () => {
    render(<Hero section={fixtureSection("hero")} settings={settings} />);

    expect(screen.getByText(/2,316 reviews/)).toBeInTheDocument();
  });

  it("omits the rating when settings have none", () => {
    render(<Hero section={fixtureSection("hero")} settings={{ ...settings, rating: null }} />);

    expect(screen.queryByText(/reviews/)).toBeNull();
  });
});

describe("TextImage", () => {
  it("renders text only when the image is missing", () => {
    const { container } = render(<TextImage section={fixtureSection("text_image", { image: null })} settings={settings} />);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector(".lg\\:grid-cols-2")).toBeNull();
  });

  it("renders the rich text body as HTML", () => {
    const { container } = render(<TextImage section={fixtureSection("text_image")} settings={settings} />);

    expect(container.querySelectorAll(".rich-text p")).toHaveLength(2);
  });
});

describe("empty lists", () => {
  it.each([
    ["cards", Cards],
    ["testimonials", Testimonials],
    ["stats", Stats],
    ["faq", Faq],
  ] as const)("%s with no items renders nothing", (layout, Component) => {
    const section = fixtureSection(layout, { items: [] });
    // @ts-expect-error each row pairs a layout with its own component
    const { container } = render(<Component section={section} settings={settings} />);

    expect(container.innerHTML).toBe("");
  });
});

describe("Cards", () => {
  it("uses an ordered list when numbered", () => {
    render(<Cards section={fixtureSection("cards")} settings={settings} />);

    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });
});

describe("Testimonials", () => {
  it("gives each star rating a text alternative", () => {
    render(<Testimonials section={fixtureSection("testimonials")} settings={settings} />);

    expect(screen.getAllByText("Rated 5 out of 5")).toHaveLength(3);
  });
});

describe("Cta", () => {
  it("renders the heading but no link when the link is missing", () => {
    render(<Cta section={fixtureSection("cta", { cta: null })} settings={settings} />);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("Faq", () => {
  it("uses details and summary for each question", () => {
    const { container } = render(<Faq section={fixtureSection("faq")} settings={settings} />);

    expect(container.querySelectorAll("details")).toHaveLength(5);
    expect(container.querySelector("details summary")).toHaveTextContent("How do you work out my valuation?");
  });
});

describe("Contact", () => {
  it("puts the form beside the rating, trust points and a click to call link", () => {
    render(<Contact section={fixtureSection("contact")} settings={settings} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Get your free valuation");
    expect(screen.getByLabelText(/registration/i)).toBeInTheDocument();
    expect(screen.getByText("No obligation to sell")).toBeInTheDocument();
    expect(screen.getByText(/rated 4.8 out of 5/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /0161 496 0000/ })).toHaveAttribute("href", "tel:01614960000");
  });

  it("still renders the form without trust points, rating or phone", () => {
    render(
      <Contact
        section={fixtureSection("contact", { trustPoints: [] })}
        settings={{ ...settings, rating: null, phone: null }}
      />,
    );

    expect(screen.getByLabelText(/registration/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
