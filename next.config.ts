import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Dynamic pages otherwise stream <title> and <meta name="description"> into the body.
  // Crawlers that read <head> then miss them. Block so metadata is in the head for every UA.
  htmlLimitedBots: /.*/,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons**" },
    ],
  },
  async redirects() {
    return [
      { source: "/jobs", destination: "/", permanent: true },
      { source: "/titles/:slug", destination: "/roles/:slug", permanent: true },
      { source: "/titles/:slug/remote", destination: "/roles/:slug/remote", permanent: true },
      { source: "/salaries", destination: "/salary", permanent: true },
      { source: "/salaries/:slug", destination: "/salary/:slug", permanent: true },
    ];
  },
};

const withMDX = createMDX({ extension: /\.mdx?$/ });

export default withMDX(nextConfig);
