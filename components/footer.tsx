import Link from "next/link";
import { ArrowRight, Rss } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ROLES, SENIORITIES, SKILLS } from "@/lib/catalog";
import { LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

const SKILL_SLUGS = ["react", "figma", "framer", "design-systems", "motion", "threejs"] as const;
const LEVEL_SLUGS = ["senior", "staff", "lead", "founding", "internship"] as const;

function reportPath(now = new Date()) {
  return `/reports/${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function Footer() {
  const roles = ROLES.filter((role) => role.priority);
  const skills = SKILLS.filter((skill) => (SKILL_SLUGS as readonly string[]).includes(skill.slug));
  const levels = SENIORITIES.filter((level) => (LEVEL_SLUGS as readonly string[]).includes(level.slug));
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-line py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">Hiring a designer who codes?</p>
            <p className="mt-1 text-sm text-muted">
              ${STANDARD_PRICE_USD} for {LISTING_DAYS} days. Live within a minute of payment. Applicants go straight to your ATS.
            </p>
          </div>
          <Link href="/post-a-job" className="btn btn-primary btn-lg shrink-0">
            Post a job
            <ArrowRight className="arrow" />
          </Link>
        </div>

        <div className="grid gap-10 py-12 text-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs leading-relaxed text-muted">
              Design Code Jobs is a job board for design engineers: software designers who code. Mechanical, hardware, and chip jobs are left out.
            </p>
            <Link href="/feed.xml" className="mt-5 inline-flex items-center gap-1.5 text-muted hover:text-fg">
              <Rss /> RSS feed
            </Link>
          </div>
          <FooterColumn
            title="Roles"
            links={[
              ...roles.map((role) => ({ href: `/roles/${role.slug}`, label: role.h1 })),
              { href: "/roles/design-engineer", label: "Software design engineer jobs" },
            ]}
          />
          <FooterColumn
            title="Browse"
            links={[
              { href: "/remote", label: "Remote jobs" },
              ...skills.map((skill) => ({ href: `/skills/${skill.slug}`, label: skill.h1 })),
            ]}
          />
          <FooterColumn
            title="Levels and pay"
            links={[
              ...levels.map((level) => ({ href: `/seniority/${level.slug}`, label: level.h1 })),
              { href: "/salary", label: "Design engineer salary" },
              { href: reportPath(), label: "Monthly jobs report" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { href: "/post-a-job", label: "Post a job" },
              { href: "/companies", label: "Companies hiring" },
              { href: "/guides", label: "Guides" },
              { href: "/about", label: "About" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} Design Code Jobs. Listings link out to the original application.</p>
          <p>Framer means the design tool, not carpentry.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-medium text-fg">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-muted transition-colors hover:text-fg">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
