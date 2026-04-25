import type { AppConfig } from "../types";

export function generateManifest(config: AppConfig) {
  const manifest = {
    name: config.title,
    short_name: config.shortName || config.title.substring(0, 12),
    start_url: config.url,
    display: config.display,
    background_color: config.backgroundColor || "#ffffff",
    theme_color: config.themeColor,
    orientation: config.orientation,
    icons: config.icons.map(icon => ({
      src: icon.src,
      sizes: icon.sizes || "512x512",
      type: icon.type || "image/png",
      purpose: "any maskable"
    }))
  };

  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manifest.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
