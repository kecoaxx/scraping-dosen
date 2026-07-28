import { withBrowser, runCLI } from "../utils/utils.js";
import { DosenRecord } from "../models/model-dosen.js";

const baseUrl = "https://konten.usu.ac.id/api/directory?lang=id&type=lecturer";
const univname = "USU";

export async function scrapeUSU() {
  return await withBrowser(async (page) => {
    let allRecords = [];
    let cursor = null;
    let hasMore = true;
    let univ = univname;

    // Set a higher default timeout (e.g., 60 seconds)
    page.setDefaultNavigationTimeout(60000);

    while (hasMore) {
      const url = cursor ? `${baseUrl}&cursor=${cursor}` : baseUrl;

      let response;
      try {
        response = await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });
      } catch (error) {
        console.warn(
          `[SCRAPER WARNING] Navigation timeout or error at URL: ${url}. Error: ${error.message}`,
        );
        console.log(
          `[SCRAPER] Preserving ${allRecords.length} records collected so far.`,
        );
        break;
      }

      // Check for HTTP 429 Too Many Requests status
      if (response && response.status() === 429) {
        console.warn(
          `[SCRAPER WARNING] Stopped due to HTTP 429 (Too Many Requests) at URL: ${url}`,
        );
        console.log(
          `[SCRAPER] Returning ${allRecords.length} partial records collected so far.`,
        );
        break;
      }

      // Extract the JSON content from the page body
      const content = await page.evaluate(() => {
        try {
          return JSON.parse(window.document.body.innerText);
        } catch {
          return null;
        }
      });

      if (!content || !content.data || !Array.isArray(content.data)) {
        break;
      }

      for (const item of content.data) {
        const mappedData = {
          fullname: item.title,
          nama: item.content?.name,
          fakultas: item.unit?.name,
          prodi: item.content?.departments?.[0]?.name || null,
          foto: item.content?.profile_picture || item.thumbnail || null,
          email: item.content?.email,
          link: item.content?.directory || null,
          univ: univ,
        };

        allRecords.push(new DosenRecord(mappedData));
      }

      console.log("next cursor: ", content.next_cursor);

      if (content.next_cursor) {
        cursor = content.next_cursor;
      } else {
        hasMore = false;
      }
    }

    return allRecords;
  });
}

// Reusable CLI execution
runCLI(import.meta.url, scrapeUSU, univname);
