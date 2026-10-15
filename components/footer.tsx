import Link from "next/link";
import { ROLES, SKILLS } from "@/lib/catalog";

export function Footer() {
  const roles = ROLES.filter((role) => role.priority);
  return (
    <footer className="mt-20 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 text-sm text-muted sm:grid-cols-4">
        <div>
          <p className="font-medium text-fg">Design Code Jobs</p>
          <p className="mt-3 leading-relaxed">
            Software roles for designers who code. Mechanical, hardware, and chip jobs are left out.
          </p>
        </div>
        <div>
          <p className="font-medium text-fg">Roles</p>
          <ul className="mt-3 space-y-2">
            {roles.map((role) => (
              <li key={role.slug}>
                <Link href={`/roles/${role.slug}`} className="hover:text-fg">
                  {role.h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-fg">Browse</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/remote" className="hover:text-fg">Remote design engineer jobs</Link></li>
            <li><Link href="/seniority/internship" className="hover:text-fg">Design engineer internship</Link></li>
            <li><Link href="/skills/framer" className="hover:text-fg">Framer jobs</Link></li>
            <li><Link href="/salary" className="hover:text-fg">Design engineer salary</Link></li>
            <li><Link href="/companies" className="hover:text-fg">Companies</Link></li>
            <li><Link href="/guides" className="hover:text-fg">Guides</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-fg">About</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/about" className="hover:text-fg">About</Link></li>
            {/* TODO: no support email is configured. Link it here when one exists. */}
            <li><Link href="/about#contact" className="hover:text-fg">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-fg">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-fg">Terms</Link></li>
            <li><Link href="/feed.xml" className="hover:text-fg">RSS</Link></li>
            <li><Link href="/post-a-job" className="hover:text-fg">Post a job · $129</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-10 text-xs leading-5 text-muted">
        {SKILLS.find((skill) => skill.slug === "framer")?.label} means the design tool. Listings link out to the original application.
      </p>
    </footer>
  );
}
