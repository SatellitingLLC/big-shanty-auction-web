import postcss, { type Container } from "postcss";
import selectorParser from "postcss-selector-parser";

const ALLOWED_AT_RULES = new Set([
  "media",
  "supports",
  "container",
  "keyframes",
  "-webkit-keyframes",
  "-moz-keyframes",
]);

function scopeRules(container: Container) {
  for (const node of [...(container.nodes ?? [])]) {
    if (node.type === "atrule") {
      const name = node.name.toLowerCase();
      if (!ALLOWED_AT_RULES.has(name)) {
        node.remove();
      } else if (!name.endsWith("keyframes")) {
        scopeRules(node);
      }
      continue;
    }

    if (node.type !== "rule") {
      continue;
    }

    node.selector = selectorParser((selectors) => {
      selectors.each((selector) => {
        const first = selector.nodes[0];
        const isRoot =
          (first?.type === "tag" && ["html", "body"].includes(first.value.toLowerCase())) ||
          (first?.type === "pseudo" && first.value.toLowerCase() === ":root");

        if (isRoot) {
          const space = selector.nodes[1];
          const hadDescendantSpace = space?.type === "combinator" && space.value.trim() === "";
          first.remove();
          if (hadDescendantSpace) {
            space.remove();
          }

          const root = selectorParser.className({ value: "landing-page" });
          selector.prepend(root);
          if (hadDescendantSpace) {
            selector.insertAfter(root, selectorParser.combinator({ value: " " }));
          }
        } else if (!(first?.type === "class" && first.value === "landing-page")) {
          selector.prepend(selectorParser.combinator({ value: " " }));
          selector.prepend(selectorParser.className({ value: "landing-page" }));
        }
      });
    }).processSync(node.selector);
  }
}

export function scopeLandingPageCss(css: string) {
  const root = postcss.parse(css);
  const keyframes = new Map<string, string>();

  root.walkAtRules(/(?:^|-)keyframes$/i, (rule) => {
    const name = rule.params.trim();
    if (/^[a-z_][\w-]*$/i.test(name)) {
      keyframes.set(name, `landing-${name}`);
      rule.params = `landing-${name}`;
    }
  });

  root.walkDecls(/^(?:-webkit-)?animation(?:-name)?$/i, (declaration) => {
    for (const [name, scopedName] of keyframes) {
      declaration.value = declaration.value.replace(
        new RegExp(`(^|[\\s,])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s,]|$)`, "g"),
        `$1${scopedName}`,
      );
    }

    if (/(?:^|-)(?:behavior|binding)$/i.test(declaration.prop) || /expression\s*\(|url\s*\(\s*['"]?\s*javascript:/i.test(declaration.value)) {
      declaration.remove();
    }
  });

  scopeRules(root);
  return root.toString();
}
