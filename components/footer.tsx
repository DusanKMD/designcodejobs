import Link from "next/link";
import { ROLES, SKILLS } from "@/lib/catalog";

export function Footer() {
  const roles = ROLES.filter((role) => role.priority);
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 text-sm text-muted sm:grid-cols-4">
        <div>
          <p className="font-medium text-fg">Design Code Jobs</p>
          <p className="mt-2 leading-relaxed">
            Software roles for designers who code. Mechanical, hardware, and chip jobs are left out.
          </p>
        </div>
        <div>
          <p className="font-medium text-fg">Roles</p>
          <ul className="mt-2 space-y-1.5">
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
          <ul className="mt-2 space-y-1.5">
            <li><Link href="/remote" className="hover:text-fg">Remote design engineer jobs</Link></li>
            <li><Link href="/seniority/internship" className="hover:text-fg">Design engineer internship</Link></li>
            <li><Link href="/skills/framer" className="hover:text-fg">Framer jobs</Link></li>
            <li><Link href="/salary" className="hover:text-fg">Design engineer salary</Link></li>
            <li><Link href="/companies" className="hover:text-fg">Companies</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-fg">About</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link href="/guides/what-is-a-design-engineer" className="hover:text-fg">What is a design engineer?</Link></li>
            <li><Link href="/guides/design-engineer-job-description" className="hover:text-fg">Job description</Link></li>
            <li><Link href="/about" className="hover:text-fg">About</Link></li>
            <li><Link href="/feed.xml" className="hover:text-fg">RSS</Link></li>
            <li><Link href="/post-a-job" className="hover:text-fg">Post a job · $129</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-5xl px-5 pb-8 text-xs text-muted">
        {SKILLS.find((skill) => skill.slug === "framer")?.label} means the design tool. Listings link out to the original application.
      </p>
    </footer>
  );
}
