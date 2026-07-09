import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/attendees",
        permanent: true,
      },
      {
        source: "/vendor-list",
        destination: "/vendors/list",
        permanent: true,
      },
      {
        source: "/vendor-materials",
        destination: "/vendors/info",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/news",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
