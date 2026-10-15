import { GUIDES, REGIONS, ROLES, SALARY_ROLES, SENIORITIES, SKILLS } from "@/lib/catalog";
import { companyStats, filterJobs, listedJobs, listingRobots } from "@/lib/query";
import { COMPANY_INDEX_THRESHOLD, INDEX_THRESHOLD } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export async function indexablePagePaths() {
  const jobs = await getAllJobs();
  const paths: string[] = [];
  if (listingRobots(filterJobs(jobs, {}).length, "/", {}).index) paths.push("/");
  paths.push("/salary", "/about", "/post-a-job", "/companies", "/guides", "/privacy", "/terms");
  for (const guide of GUIDES) paths.push(`/guides/${guide.slug}`);
  for (const role of ROLES) {
    if (filterJobs(jobs, { title: role.slug }).length >= INDEX_THRESHOLD) paths.push(`/roles/${role.slug}`);
    if (filterJobs(jobs, { title: role.slug, remote: true }).length >= INDEX_THRESHOLD) {
      paths.push(`/roles/${role.slug}/remote`);
    }
  }
  if (filterJobs(jobs, { remote: true }).length >= INDEX_THRESHOLD) paths.push("/remote");
  for (const region of REGIONS) {
    if (filterJobs(jobs, { remote: true, region: region.slug }).length >= INDEX_THRESHOLD) {
      paths.push(`/remote/${region.slug}`);
    }
  }
  for (const skill of SKILLS) {
    if (filterJobs(jobs, { skill: skill.slug }).length >= INDEX_THRESHOLD) paths.push(`/skills/${skill.slug}`);
  }
  for (const level of SENIORITIES) {
    if (filterJobs(jobs, { seniority: level.slug }).length >= INDEX_THRESHOLD) paths.push(`/seniority/${level.slug}`);
  }
  for (const salary of SALARY_ROLES) {
    const count = listedJobs(jobs).filter((job) => job.titleFamily === salary.family && job.salaryUnit === "YEAR").length;
    if (count >= 1) paths.push(`/salary/${salary.slug}`);
  }
  const slugs = new Set(jobs.map((job) => job.companySlug));
  for (const slug of slugs) {
    if (companyStats(jobs, slug).open.length >= COMPANY_INDEX_THRESHOLD) paths.push(`/companies/${slug}`);
  }
  const month = new Date();
  paths.push(`/reports/${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`);
  return paths;
}
