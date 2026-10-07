import sanitizeHtml from "sanitize-html";

import { LandingPageContent } from "@/components/site/LandingPageContent";
import { scopeLandingPageCss } from "@/lib/page-css";
import type { PageDocument } from "@/lib/page-seed";

type SanitizeOptions = NonNullable<Parameters<typeof sanitizeHtml>[1]> & {
  exclusiveFilter: (frame: { tag: string }) => boolean;
};

function sanitizeMarkup(markup: string) {
  const options: SanitizeOptions = {
    allowedTags: [
      "address",
      "a",
      "article",
      "aside",
      "blockquote",
      "br",
      "button",
      "cite",
      "circle",
      "dd",
      "dl",
      "dt",
      "div",
      "em",
      "fieldset",
      "figcaption",
      "figure",
      "footer",
      "form",
      "g",
      "h1",
      "h2",
      "h3",
      "h4",
      "header",
      "i",
      "img",
      "input",
      "label",
      "legend",
      "li",
      "line",
      "main",
      "nav",
      "ol",
      "p",
      "path",
      "rect",
      "section",
      "small",
      "span",
      "strong",
      "svg",
      "textarea",
      "text",
      "ul",
    ],
    allowedAttributes: {
      "*": [
        "class",
        "id",
        "href",
        "target",
        "rel",
        "type",
        "role",
        "name",
        "value",
        "placeholder",
        "required",
        "checked",
        "autocomplete",
        "for",
        "data-contact-form",
        "aria-label",
        "aria-expanded",
        "aria-controls",
        "aria-live",
        "aria-roledescription",
        "aria-hidden",
      ],
      a: ["href", "target", "rel", "class", "id"],
      button: ["type", "class", "id", "aria-label", "aria-expanded", "aria-controls"],
      img: ["src", "alt", "width", "height", "loading", "decoding", "class", "id"],
      input: ["type", "name", "value", "id", "class", "placeholder", "required", "checked", "autocomplete"],
      label: ["for", "class", "id"],
      form: ["class", "id", "data-contact-form"],
      textarea: ["name", "id", "class", "placeholder", "required", "rows", "cols"],
      svg: ["viewBox", "fill", "stroke", "stroke-width", "class", "id", "aria-hidden"],
      circle: ["cx", "cy", "r", "fill", "stroke", "stroke-width"],
      g: ["transform"],
      line: ["x1", "y1", "x2", "y2", "stroke-width"],
      path: ["d", "fill", "stroke", "stroke-width"],
      rect: ["x", "y", "width", "height", "rx", "ry", "fill", "stroke", "stroke-width"],
      text: ["x", "y", "font-family", "font-size", "text-anchor", "fill", "stroke"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    exclusiveFilter: (frame) => frame.tag === "nav" || frame.tag === "footer",
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: attribs.rel ?? "noopener noreferrer",
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          ...(attribs.src === "/assets/auction-photo.png" && !attribs.alt?.trim()
            ? { alt: "Big Shanty Auction logo" }
            : {}),
          loading: attribs.loading ?? "lazy",
          decoding: attribs.decoding ?? "async",
        },
      }),
    },
  };

  return sanitizeHtml(markup, options);
}

export function LandingPageRenderer({ page }: { page: PageDocument }) {
  const html = sanitizeMarkup(page.html);
  const css = scopeLandingPageCss(`${page.baseCss}\n${page.css}`);

  return (
    <>
      <style>{css}</style>
      <LandingPageContent html={html} />
    </>
  );
}
