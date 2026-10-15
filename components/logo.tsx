import Link from "next/link";

/** The </> mark. The slash is a pen-tool handle; the square is a selected anchor point. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden
      className={`logo-mark shrink-0 ${className}`}
    >
      <rect width="32" height="32" rx="8" className="logo-tile" />
      <path
        d="M11.2 10.4 6.6 16l4.6 5.6M20.8 10.4l4.6 5.6-4.6 5.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-brackets"
      />
      <g className="logo-handle">
        <path d="M18.7 8.6 13.3 23.4" stroke="#fff" strokeOpacity=".55" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="18.7" cy="8.6" r="1.6" fill="#fff" />
        <circle cx="13.3" cy="23.4" r="1.6" fill="#fff" />
        <rect x="13.4" y="13.4" width="5.2" height="5.2" rx="1.1" className="logo-anchor" stroke="#fff" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`logo group inline-flex items-center gap-2.5 ${className}`} aria-label="Design Code Jobs, home">
      <LogoMark size={30} />
      <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
        Design Code <span className="text-muted transition-colors group-hover:text-fg">Jobs</span>
      </span>
    </Link>
  );
}
