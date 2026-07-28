import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { fileURLToPath } from "url";
import { saveJSON } from "../scripts/writejson.js"; // Adjust path if needed

puppeteer.use(StealthPlugin());

/**
 * Handles launching the browser, creating a page, and safely closing it.
 * Takes a callback function containing the site-specific scraping logic.
 */
export async function withBrowser(scrapeLogic) {
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    // Execute the specific scraper logic passed into this function
    return await scrapeLogic(page);
  } catch (error) {
    console.error("Scraping failed:", error);
    return error.partialData || [];
  } finally {
    await browser.close();
  }
}

/**
 * Replaces the repetitive CLI check block at the bottom of your files.
 */
export async function runCLI(metaUrl, scraperFunction, univName) {
  if (process.argv[1] === fileURLToPath(metaUrl)) {
    console.log(`Running ${univName} scraper directly from the command line!`);

    const scrape = await scraperFunction();

    // Save JSON as long as scrape is an array, even if it's empty or contains partial records
    if (Array.isArray(scrape)) {
      console.log(`Found ${scrape.length} lecturers.`);
      await saveJSON(scrape, univName);
    } else {
      console.log(`No valid data returned for ${univName}.`);
    }
  }
}
