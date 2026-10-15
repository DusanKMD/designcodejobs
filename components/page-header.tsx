import { Breadcrumbs } from "@/components/ui";

/** Canvas band used at the top of content pages. */
export function PageHeader({
  crumbs,
  kicker,
  title,
  lede,
  children,
  narrow,
}: {
  crumbs?: { name: string; path: string }[];
  kicker?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute inset-0 -z-10" aria-hidden />
      <div className={`mx-auto px-5 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
        {crumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
        {kicker ? (
          <p className="mt-7 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent-text">{kicker}</p>
        ) : null}
        <h1 className={`${kicker ? "mt-2" : "mt-7"} max-w-3xl text-[40px] sm:text-[56px]`}>{title}</h1>
        {lede ? <div className="mt-4 max-w-2xl text-[17px] leading-7 text-fg-2">{lede}</div> : null}
        {children}
      </div>
    </section>
  );
}
