import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Scrape metadata from URL
  app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const title = $("title").text() || $('meta[property="og:title"]').attr("content") || "";
      const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
      const themeColor = $('meta[name="theme-color"]').attr("content") || "#ffffff";
      
      // Extract icons
      const icons: { src: string; sizes?: string; type?: string }[] = [];
      $('link[rel*="icon"]').each((i, el) => {
        const href = $(el).attr("href");
        if (href) {
            const absoluteHref = new URL(href, url).href;
            icons.push({
                src: absoluteHref,
                sizes: $(el).attr("sizes"),
                type: $(el).attr("type")
            });
        }
      });
      
      // Check for apple-touch-icon
       $('link[rel="apple-touch-icon"]').each((i, el) => {
        const href = $(el).attr("href");
        if (href) {
            icons.push({ src: new URL(href, url).href, sizes: $(el).attr("sizes") || "180x180" });
        }
      });

      res.json({
        title,
        description,
        themeColor,
        icons,
        url
      });
    } catch (error: any) {
      console.error("Scrape error:", error.message);
      res.status(500).json({ error: "Failed to scrape URL. It might be blocking automated requests." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
