/** Inline 16px stroke icons. Decorative: always aria-hidden. */
type IconProps = { className?: string; size?: number };

function Svg({ className = "", size = 16, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </Svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 11 11 5M6 5h5v5" />
  </Svg>
);

export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </Svg>
);

export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3.5 8.5 3 3 6-7" />
  </Svg>
);

export const Pin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10 8 14 8 14Z" />
    <circle cx="8" cy="6.5" r="1.5" />
  </Svg>
);

export const Globe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M2.5 8h11M8 2.25c1.6 1.6 2.4 3.5 2.4 5.75S9.6 12.15 8 13.75C6.4 12.15 5.6 10.25 5.6 8S6.4 3.85 8 2.25Z" />
  </Svg>
);

export const Clock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M8 5v3l2 1.5" />
  </Svg>
);

export const Lock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.25" y="7" width="9.5" height="6.5" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </Svg>
);

export const Bolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 1.75 3.75 9h4l-1 5.25L12.25 7h-4L9 1.75Z" />
  </Svg>
);

export const Sparkle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 2.5c.5 2.6 1.9 4 4.5 4.5-2.6.5-4 1.9-4.5 4.5-.5-2.6-1.9-4-4.5-4.5 2.6-.5 4-1.9 4.5-4.5Z" />
  </Svg>
);

export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.75 9.25a2.5 2.5 0 0 0 3.54 0l2-2a2.5 2.5 0 1 0-3.54-3.54l-.5.5" />
    <path d="M9.25 6.75a2.5 2.5 0 0 0-3.54 0l-2 2a2.5 2.5 0 0 0 3.54 3.54l.5-.5" />
  </Svg>
);

export const Building = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="2.5" width="7" height="11" rx="1" />
    <path d="M10 6.5h2a1 1 0 0 1 1 1v6h-3M5.5 5.5h2M5.5 8h2M5.5 10.5h2" />
  </Svg>
);

export const Bell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3L4 11ZM6.5 14h3" />
  </Svg>
);

export const Plus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);

export const Shield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 1.75 13 3.5v4c0 3.2-2.1 5.6-5 6.75C5.1 13.1 3 10.7 3 7.5v-4l5-1.75Z" />
    <path d="m5.75 8 1.6 1.6L10.5 6.5" />
  </Svg>
);

export const Eye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M1.75 8S4 3.5 8 3.5 14.25 8 14.25 8 12 12.5 8 12.5 1.75 8 1.75 8Z" />
    <circle cx="8" cy="8" r="2" />
  </Svg>
);

export const Layers = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 2 14 5 8 8 2 5l6-3Z" />
    <path d="m2 8 6 3 6-3M2 11l6 3 6-3" />
  </Svg>
);

export const Inbox = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 9.5 4 3.5h8l1.5 6v3a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-3Z" />
    <path d="M2.5 9.5h3l1 1.5h3l1-1.5h3" />
  </Svg>
);

export const Wallet = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="4" width="12" height="9" rx="1.75" />
    <path d="M2 6.5h12M10.5 9.75h1" />
  </Svg>
);

export const Rss = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 3.5a9 9 0 0 1 9 9M3.5 7.5a5 5 0 0 1 5 5" />
    <circle cx="4" cy="12" r=".75" fill="currentColor" />
  </Svg>
);
