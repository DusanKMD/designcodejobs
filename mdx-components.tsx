import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";

function headingText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(headingText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return headingText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function headingId(children: ReactNode, id?: string) {
  if (id) return id;
  return headingText(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props: ComponentProps<"h1">) => <h1 className="text-5xl text-balance sm:text-6xl" {...props} />,
    h2: ({ id, children, ...props }: ComponentProps<"h2">) => (
      <h2 id={headingId(children, id)} className="mt-12 scroll-mt-24 text-2xl font-medium tracking-tight text-fg" {...props}>{children}</h2>
    ),
    h3: ({ id, children, ...props }: ComponentProps<"h3">) => (
      <h3 id={headingId(children, id)} className="mt-8 scroll-mt-24 text-lg font-medium text-fg" {...props}>{children}</h3>
    ),
    p: (props: ComponentProps<"p">) => <p className="mt-4 text-[17px] leading-8 text-muted" {...props} />,
    ul: (props: ComponentProps<"ul">) => <ul className="mt-4 list-disc space-y-2 pl-5 text-[17px] leading-8 text-muted" {...props} />,
    ol: (props: ComponentProps<"ol">) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-[17px] leading-8 text-muted" {...props} />,
    a: (props: ComponentProps<"a">) => <a className="text-fg underline underline-offset-4" {...props} />,
    strong: (props: ComponentProps<"strong">) => <strong className="font-medium text-fg" {...props} />,
    pre: (props: ComponentProps<"pre">) => (
      <pre className="mt-4 overflow-x-auto rounded-lg border border-line p-4 text-[13px] leading-6 text-fg" {...props} />
    ),
    ...components,
  };
}
