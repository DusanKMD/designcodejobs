import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props: ComponentProps<"h1">) => <h1 className="text-5xl text-balance sm:text-6xl" {...props} />,
    h2: (props: ComponentProps<"h2">) => <h2 className="mt-12 text-2xl font-medium tracking-tight text-fg" {...props} />,
    h3: (props: ComponentProps<"h3">) => <h3 className="mt-8 text-lg font-medium text-fg" {...props} />,
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
