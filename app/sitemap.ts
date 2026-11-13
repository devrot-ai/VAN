import type { MetadataRoute } from "next";

const routes = [
  "/",
  "/platform",
  "/platform/farm-intelligence",
  "/platform/machinery",
  "/platform/services",
  "/platform/harvest-logistics",
  "/platform/finance-commerce",
  "/platform/connected-hardware",
  "/for-farmers",
  "/for-providers",
  "/for-cooperatives",
  "/about",
  "/contact",
  "/early-access",
  "/privacy",
  "/terms",
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((url) => ({ url: `${siteUrl}${url}` }));
}
