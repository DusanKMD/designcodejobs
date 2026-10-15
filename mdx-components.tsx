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
    h1: (props: ComponentProps<"h1">) => <h1 className="mt-4 text-[40px] leading-[1.04] sm:text-[54px]" {...props} />,
    h2: ({ id, children, ...props }: ComponentProps<"h2">) => (
      <h2 id={headingId(children, id)} className="mt-14 scroll-mt-24 text-[26px] leading-tight tracking-tight text-fg" {...props}>{children}</h2>
    ),
    h3: ({ id, children, ...props }: ComponentProps<"h3">) => (
      <h3 id={headingId(children, id)} className="mt-9 scroll-mt-24 text-lg font-semibold tracking-tight text-fg" {...props}>{children}</h3>
    ),
    p: (props: ComponentProps<"p">) => <p className="mt-5 text-[17px] leading-8 text-fg-2" {...props} />,
    ul: (props: ComponentProps<"ul">) => <ul className="mt-5 list-disc space-y-2 pl-5 text-[17px] leading-8 text-fg-2 marker:text-subtle" {...props} />,
    ol: (props: ComponentProps<"ol">) => <ol className="mt-5 list-decimal space-y-2 pl-5 text-[17px] leading-8 text-fg-2 marker:text-subtle" {...props} />,
    a: (props: ComponentProps<"a">) => <a className="link" {...props} />,
    strong: (props: ComponentProps<"strong">) => <strong className="font-semibold text-fg" {...props} />,
    blockquote: (props: ComponentProps<"blockquote">) => (
      <blockquote className="mt-6 border-l-2 border-accent pl-5 text-[17px] italic leading-8 text-fg-2" {...props} />
    ),
    code: (props: ComponentProps<"code">) => <code className="rounded-md bg-chip px-1.5 py-0.5 font-mono text-[0.88em] text-fg" {...props} />,
    pre: (props: ComponentProps<"pre">) => (
      <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-card p-4 font-mono text-[13px] leading-6 text-fg [&_code]:bg-transparent [&_code]:p-0" {...props} />
    ),
    hr: () => <hr className="my-12 border-line" />,
    ...components,
  };
}
