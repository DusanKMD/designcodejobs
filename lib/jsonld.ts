import { countryLabel, EU_APPLICANT_COUNTRIES } from "@/lib/location";
import { absoluteUrl } from "@/lib/site";
import type { Job } from "@/lib/types";
import { effectiveStatus } from "@/lib/model";

const EMPLOYMENT: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACTOR: "CONTRACTOR",
  TEMPORARY: "TEMPORARY",
  INTERN: "INTERN",
};

function countryNode(code: string) {
  return { "@type": "Country", name: countryLabel(code) };
}

/**
 * JobPosting for a single active job. Returns null for expired, thin, or
 * unmappable roles so we never emit markup Google would reject.
 * Remote roles get TELECOMMUTE and applicantLocationRequirements, and no jobLocation.
 * Hybrid and on-site roles get jobLocation only.
 */
export function buildJobPosting(job: Job, now = new Date()) {
  if (effectiveStatus(job, now) !== "active") return null;
  const description = (job.descriptionHtml || "").trim();
  const plain = job.descriptionText.trim();
  if (plain.length < 80 || plain.toLowerCase() === job.title.toLowerCase()) return null;
  if (!job.datePosted || !job.applyUrl) return null;

  const posting: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.datePosted,
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      sameAs: `https://${job.companyDomain}`,
      logo: absoluteUrl(`/logo/${job.companySlug}`),
    },
    identifier: {
      "@type": "PropertyValue",
      name: "Design Code Jobs",
      value: job.id,
    },
    url: absoluteUrl(`/jobs/${job.slug}`),
  };

  if (job.employmentType && EMPLOYMENT[job.employmentType]) {
    posting.employmentType = EMPLOYMENT[job.employmentType];
  }
  if (job.validThrough) posting.validThrough = job.validThrough;

  if (
    job.salaryUnit &&
    job.salaryCurrency &&
    job.salaryMin != null &&
    job.salaryMax != null
  ) {
    posting.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: job.salaryUnit,
      },
    };
  }

  if (job.workplace === "remote") {
    const codes = job.applicantCountries.length
      ? job.applicantCountries
      : [];
    if (!codes.length) return null;
    const nodes = codes.map(countryNode);
    posting.jobLocationType = "TELECOMMUTE";
    posting.applicantLocationRequirements = nodes.length === 1 ? nodes[0] : nodes;
    return posting;
  }

  const places = job.locations.filter((loc) => loc.country);
  if (!places.length) return null;
  const mapped = places.map((loc) => ({
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      ...(loc.locality ? { addressLocality: loc.locality } : {}),
      ...(loc.region ? { addressRegion: loc.region } : {}),
      addressCountry: loc.country,
    },
  }));
  posting.jobLocation = mapped.length === 1 ? mapped[0] : mapped;
  return posting;
}

export function euApplicantCodes() {
  return [...EU_APPLICANT_COUNTRIES];
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function websiteLd() {
  const url = absoluteUrl("/");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Design Code Jobs",
      url,
      logo: absoluteUrl("/logo/designcodejobs"),
      description: "A job board for software design engineers, UX engineers, and designers who code.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Design Code Jobs",
      url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function datasetLd(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    creator: { "@type": "Organization", name: "Design Code Jobs", url: absoluteUrl("/") },
    license: absoluteUrl("/about"),
    isAccessibleForFree: true,
  };
}
