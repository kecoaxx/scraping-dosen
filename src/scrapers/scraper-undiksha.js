import { withBrowser, runCLI } from "../utils/utils.js";
import { DosenRecord } from "../models/model-dosen.js";

const link = "https://dosen.undiksha.ac.id/search_result/dosen";
const univname = "UNDIKSHA";

export async function scrapeUNDIKSHA() {
  return await withBrowser(async (page) => {
    await page.setJavaScriptEnabled(false);
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("table", { timeout: 60000 });

    const lecturersData = await page.$$eval(
      "table tbody tr",
      (rows, passedUnivName) => {
        return rows
          .map((row) => {
            const cells = row.querySelectorAll("td");

            const anchorA1 = cells[1].querySelector("a");
            const anchorImg = anchorA1.querySelector("img");

            const image = anchorImg ? anchorImg.getAttribute("src") : "";

            const anchorA2 = cells[2].querySelector("a");
            const anchorHref = anchorA2.getAttribute("href");

            const fullname = anchorA2 ? anchorA2.innerText.trim() : "";
            const link = anchorHref ? anchorHref.trim() : "";

            const unitLines = cells[3].innerText
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);

            const fakultas = unitLines[0] || "";
            const prodi = unitLines[1] || "";

            return {
              fullname: fullname,
              nama: fullname
                .replace(/^(?:[a-zA-Z]+\.\s*)+|(?:,.*)$/g, "")
                .trim(),
              fakultas: fakultas,
              prodi: prodi,
              foto: image,
              link: link,
              univ: passedUnivName,
            };
          })
          .filter((row) => row !== null);
      },
      univname,
    );

    // 3. Transform the raw data into your standardized class
    return lecturersData.map((item) => new DosenRecord(item));
  });
}

// Reusable CLI execution
runCLI(import.meta.url, scrapeUNDIKSHA, univname);
