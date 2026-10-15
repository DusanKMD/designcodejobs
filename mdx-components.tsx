import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props: ComponentProps<"h1">) => <h1 className="text-4xl font-medium tracking-tight text-balance sm:text-5xl" {...props} />,
    h2: (props: ComponentProps<"h2">) => <h2 className="mt-10 text-xl font-medium tracking-tight text-fg" {...props} />,
    h3: (props: ComponentProps<"h3">) => <h3 className="mt-6 text-base font-medium text-fg" {...props} />,
    p: (props: ComponentProps<"p">) => <p className="mt-3 text-[15px] leading-7 text-muted" {...props} />,
    ul: (props: ComponentProps<"ul">) => <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-muted" {...props} />,
    ol: (props: ComponentProps<"ol">) => <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-7 text-muted" {...props} />,
    a: (props: ComponentProps<"a">) => <a className="text-fg underline underline-offset-4" {...props} />,
    ...components,
  };
}
