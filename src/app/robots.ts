import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { deploymentConfig } from "@/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  if (deploymentConfig.isAdmin) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
