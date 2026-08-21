import type { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({
  id: "/",
  name: "Quillo",
  short_name: "Quillo",
  description: "Personal tasks manager inspired by Scrum.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  display_override: ["window-controls-overlay", "standalone"],
  orientation: "any",
  background_color: "#ffffff",
  theme_color: "#ffffff",
  lang: "en",
  dir: "ltr",
  categories: ["productivity", "utilities"],
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  shortcuts: [
    {
      name: "Tasks",
      short_name: "Tasks",
      description: "Open today's tasks",
      url: "/",
      icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
    },
    {
      name: "Backlog",
      short_name: "Backlog",
      description: "Open the backlog",
      url: "/backlog",
      icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
    },
    {
      name: "Sprints",
      short_name: "Sprints",
      description: "Open sprints",
      url: "/sprints",
      icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
    },
  ],
});

export default manifest;
