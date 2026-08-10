import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://scandriver.in";
  const lastModDate = new Date("2026-08-10T06:15:33+00:00");

  const services = [
    "hourly",
    "monthly",
    "weekly",
    "outstation",
    "corporate",
    "airport",
    "event",
  ];

  const serviceUrls: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/booking?service=${service}`,
    lastModified: lastModDate,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: lastModDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: lastModDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...serviceUrls,
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: lastModDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: lastModDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cancellation-and-refund-policy`,
      lastModified: lastModDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
