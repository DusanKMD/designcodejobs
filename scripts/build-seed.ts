import fs from "node:fs";
import path from "node:path";
import { readBoard } from "@/lib/ingest";
import { isGone } from "@/lib/model";
import type { Ats, Job } from "@/lib/types";

type RawJob = {
  title: string;
  company: string;
  ats: Ats;
  location: string;
  remote: boolean;
  url: string;
  posted: string;
};

function externalId(job: RawJob) {
  const ashby = job.url.match(/([0-9a-f]{8}-[0-9a-f-]{27})/i);
  if (ashby) return ashby[1];
  const gh = job.url.match(/jobs\/(\d+)/) || job.url.match(/gh_jid=(\d+)/);
  return gh ? gh[1] : job.url;
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "jobs.json"), "utf8")) as RawJob[];
  const groups = new Map<string, RawJob[]>();
  for (const job of raw) {
    const key = `${job.company}:${job.ats}`;
    groups.set(key, [...(groups.get(key) || []), job]);
  }

  const seeded: Job[] = [];
  const missing: string[] = [];
  for (const [key, items] of groups) {
    const [company, ats] = key.split(":") as [string, Ats];
    let found: Job[] = [];
    try {
      const collected = await readBoard(company, ats);
      found = collected.jobs;
      console.log(`${key}: ${found.length} candidates`);
    } catch (error) {
      console.error(`${key} failed`, error instanceof Error ? error.message : error);
    }
    for (const item of items) {
      const id = externalId(item);
      const match = found.find((job) => job.externalId === id || job.applyUrl.includes(id) || job.sourceUrl.includes(id));
      if (!match) {
        missing.push(`${item.company} — ${item.title}`);
        continue;
      }
      seeded.push(match);
    }
  }

  const slugs = new Set<string>();
  for (const job of seeded) {
    if (slugs.has(job.slug)) job.slug = `${job.slug}-${job.externalId.slice(0, 4)}`;
    slugs.add(job.slug);
  }

  const out = path.join(process.cwd(), "data", "seed");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "jobs.json"), JSON.stringify(seeded, null, 2));
  fs.writeFileSync(path.join(out, "gone.json"), JSON.stringify(seeded.filter((job) => isGone(job)).map((job) => job.slug), null, 2));
  console.log(`wrote ${seeded.length} jobs, missing ${missing.length}`);
  for (const line of missing) console.log(" missing", line);
}

main();
