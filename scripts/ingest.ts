import { runIngest } from "@/lib/ingest";

const company = process.argv.find((arg) => arg.startsWith("--company="))?.split("=")[1];
const all = process.argv.includes("--all");
const result = await runIngest({ company, all });
console.log(JSON.stringify(result, null, 2));
