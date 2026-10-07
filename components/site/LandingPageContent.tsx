"use client";

import { useEffect, useRef } from "react";

import styles from "@/components/site/SiteHeader.module.css";
import { submitContactForm } from "@/lib/contact-form";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const CLOCK_LABELS = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const TESTIMONIAL_DURATION = 7000;

function drawClock(svg: SVGSVGElement) {
  const addShape = (tag: string, attributes: Record<string, string>) => {
    const shape = document.createElementNS(SVG_NAMESPACE, tag);
    for (const [name, value] of Object.entries(attributes)) {
      shape.setAttribute(name, value);
    }
    svg.append(shape);
    return shape;
  };

  for (const [radius, width] of [[98, 0.6], [92, 0.3], [64, 0.3]]) {
    addShape("circle", { r: String(radius), "stroke-width": String(width) });
  }

  for (let index = 0; index < 60; index += 1) {
    const angle = (index * Math.PI) / 30;
    const length = index % 5 === 0 ? 7 : 3;
    const radius = 92;
    addShape("line", {
      x1: String(Math.sin(angle) * radius),
      y1: String(-Math.cos(angle) * radius),
      x2: String(Math.sin(angle) * (radius - length)),
      y2: String(-Math.cos(angle) * (radius - length)),
      "stroke-width": index % 5 === 0 ? "0.7" : "0.3",
    });
  }

  CLOCK_LABELS.forEach((label, index) => {
    const angle = (index * Math.PI) / 6;
    const text = addShape("text", {
      x: String(Math.sin(angle) * 76),
      y: String(-Math.cos(angle) * 76 + 3.5),
      "font-family": "Cormorant Garamond, serif",
      "font-size": "11",
      "text-anchor": "middle",
      fill: "currentColor",
      stroke: "none",
    });
    text.textContent = label;
  });

  addShape("path", { d: "M0 0L-12 -40", "stroke-width": "1.4" });
  addShape("path", { d: "M0 0L24 -58", "stroke-width": "0.9" });
  addShape("circle", { r: "2.5", fill: "currentColor" });
}

export function LandingPageContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.querySelectorAll<SVGSVGElement>(".clock").forEach(drawClock);
    const cleanupForms = [...container.querySelectorAll<HTMLFormElement>("form[data-contact-form]")].map((form) => {
      const onSubmit = (event: SubmitEvent) => submitContactForm(form, event);

      form.addEventListener("submit", onSubmit);
      return () => form.removeEventListener("submit", onSubmit);
    });

    container.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      const label = link.textContent?.trim().toLowerCase() ?? "";
      if (["team", "meet the whole team"].includes(label)) {
        link.href = "/team";
      } else if (label === "about") {
        link.href = "/about";
      } else if (label === "contact" && link.getAttribute("href") === "#contact") {
        link.href = "/contact";
      }
    });

    const carousel = container.querySelector<HTMLElement>(".car");
    const slides = carousel
      ? [...carousel.querySelectorAll<HTMLElement>(":scope > .q")]
      : [];
    let cleanupCarousel = () => {};

    if (carousel && slides.length > 1) {
      let index = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let busy = false;
      let active = true;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const gavel = carousel.querySelector<SVGElement>(".gav");
      const ring = carousel.querySelector<HTMLElement>(".ring");
      const row = document.createElement("div");
      const previous = document.createElement("button");
      const next = document.createElement("button");
      const dots = document.createElement("div");
      const originalAttributes = ["role", "aria-live", "aria-label", "aria-roledescription"].map((name) => [
        name,
        carousel.getAttribute(name),
      ] as const);

      row.className = "row";
      previous.className = next.className = "arr";
      previous.type = next.type = "button";
      previous.setAttribute("aria-label", "Previous testimonial");
      previous.textContent = "‹";
      next.setAttribute("aria-label", "Next testimonial");
      next.type = "button";
      next.textContent = "›";
      dots.className = "dots";
      dots.setAttribute("role", "group");
      dots.setAttribute("aria-label", "Choose testimonial");

      carousel.setAttribute("role", "region");
      carousel.setAttribute("aria-label", carousel.getAttribute("aria-label") ?? "Client testimonials");
      carousel.setAttribute("aria-roledescription", "carousel");
      carousel.setAttribute("aria-live", "polite");
      slides[0].before(row);
      row.append(previous, ...slides, next);
      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== index;
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", `${slideIndex + 1} of ${slides.length}`);
      });
      carousel.append(dots);

      const dotButtons = slides.map((_, dotIndex) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show testimonial ${dotIndex + 1}`);
        dots.append(dot);
        return dot;
      });

      const fill = () => {
        slides.forEach((slide, slideIndex) => {
          slide.hidden = slideIndex !== index;
        });
        dotButtons.forEach((dot, dotIndex) => {
          dot.classList.toggle("on", dotIndex === index);
          if (dotIndex === index) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });
      };

      const startTimer = () => {
        if (!active) return;
        clearTimeout(timer);
        if (reducedMotion.matches) return;

        timer = setTimeout(() => show((index + 1) % slides.length, 1), TESTIMONIAL_DURATION);
      };

      const show = (nextIndex: number, direction: number) => {
        if (!active || busy || nextIndex === index) return;
        clearTimeout(timer);
        busy = true;
        const currentSlide = slides[index];
        const nextSlide = slides[nextIndex];

        if (reducedMotion.matches) {
          index = nextIndex;
          fill();
          busy = false;
          startTimer();
          return;
        }

        currentSlide.animate(
          [
            { opacity: 1, transform: "translateX(0)", filter: "blur(0)" },
            { opacity: 0, transform: `translateX(${-40 * direction}px)`, filter: "blur(6px)" },
          ],
          { duration: 380, easing: "ease-in", fill: "forwards" },
        ).finished.then(() => {
          if (!active) return;
          index = nextIndex;
          fill();
          gavel?.animate(
            [
              { transform: "rotate(-38deg) translateY(-6px)" },
              { transform: "rotate(-38deg) translateY(-6px)", offset: 0.2 },
              { transform: "rotate(8deg) translateY(4px)", offset: 0.55 },
              { transform: "rotate(-6deg)", offset: 0.75 },
              { transform: "rotate(0)" },
            ],
            { duration: 760, easing: "cubic-bezier(.3,0,.3,1)" },
          );
          ring?.animate(
            [
              { opacity: 0, transform: "scale(.5)" },
              { opacity: 0, offset: 0.5 },
              { opacity: 0.8, transform: "scale(1)", offset: 0.55 },
              { opacity: 0, transform: "scale(4.2)" },
            ],
            { duration: 900, easing: "ease-out" },
          );
          return nextSlide.animate(
            [
              { opacity: 0, transform: "translateY(-46px) scale(1.04)", filter: "blur(8px)" },
              { opacity: 1, transform: "translateY(6px) scale(.995)", filter: "blur(0)", offset: 0.62 },
              { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" },
            ],
            { duration: 640, delay: 260, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" },
          ).finished;
        }).then(() => {
          if (!active) return;
          slides.forEach((slide) => slide.getAnimations().forEach((animation) => animation.cancel()));
          busy = false;
          startTimer();
        }).catch((error: unknown) => {
          busy = false;
          if (!active) return;
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            console.error("Testimonial animation failed", error);
            startTimer();
          }
        });
      };

      const onPrevious = () => show((index - 1 + slides.length) % slides.length, -1);
      const onNext = () => show((index + 1) % slides.length, 1);
      const onMouseEnter = () => {
        clearTimeout(timer);
      };
      const onMouseLeave = () => {
        if (!busy) startTimer();
      };
      const onDotClick = (event: MouseEvent) => {
        if (!(event.target instanceof HTMLButtonElement)) return;
        const dotIndex = dotButtons.indexOf(event.target);
        if (dotIndex !== -1) show(dotIndex, dotIndex > index ? 1 : -1);
      };

      previous.addEventListener("click", onPrevious);
      next.addEventListener("click", onNext);
      dots.addEventListener("click", onDotClick);
      carousel.addEventListener("mouseenter", onMouseEnter);
      carousel.addEventListener("mouseleave", onMouseLeave);
      fill();
      startTimer();

      cleanupCarousel = () => {
        active = false;
        clearTimeout(timer);
        previous.removeEventListener("click", onPrevious);
        next.removeEventListener("click", onNext);
        dots.removeEventListener("click", onDotClick);
        carousel.removeEventListener("mouseenter", onMouseEnter);
        carousel.removeEventListener("mouseleave", onMouseLeave);
        [...slides, gavel, ring].forEach((element) => {
          element?.getAnimations().forEach((animation) => animation.cancel());
        });
        slides.forEach((slide) => {
          slide.hidden = false;
          slide.removeAttribute("aria-roledescription");
          slide.removeAttribute("aria-label");
        });
        originalAttributes.forEach(([name, value]) => {
          if (value === null) carousel.removeAttribute(name);
          else carousel.setAttribute(name, value);
        });
        row.before(...slides);
        row.remove();
        dots.remove();
      };
    }

    const button = container.querySelector<HTMLButtonElement>("#burger");
    const menu = container.querySelector<HTMLElement>("#menu");
    if (!button || !menu) {
      return () => {
        cleanupCarousel();
        cleanupForms.forEach((cleanup) => cleanup());
      };
    }

    const setMenuOpen = (open: boolean) => {
      menu.classList.toggle(styles.open, open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    const onMenuClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("#menu a")) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !button.contains(event.target) &&
        !menu.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 860) {
        setMenuOpen(false);
      }
    };
    const onButtonClick = () => setMenuOpen(!menu.classList.contains(styles.open));

    button.addEventListener("click", onButtonClick);
    menu.addEventListener("click", onMenuClick);
    button.setAttribute("aria-label", "Open menu");
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      cleanupCarousel();
      cleanupForms.forEach((cleanup) => cleanup());
      button.removeEventListener("click", onButtonClick);
      menu.removeEventListener("click", onMenuClick);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return <div ref={containerRef} className="landing-page" dangerouslySetInnerHTML={{ __html: html }} />;
}
