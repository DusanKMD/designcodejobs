/** UTC month key, matching the live report route. */
export function currentMonth(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(month: string) {
  const [year, value] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, value - 1, 1)),
  );
}

export function monthName(month: string) {
  const [year, value] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, value - 1, 1)));
}

/** "15 October 2026" from an ISO date. The day and month come from the snapshot, not a local timezone. */
export function longDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const name = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
  return `${day} ${name} ${year}`;
}

/** "1 October" without repeating the year already named in the sentence. */
export function dayAndMonth(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const name = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
  return `${day} ${name}`;
}
