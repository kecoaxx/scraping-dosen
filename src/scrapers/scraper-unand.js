import { withBrowser, runCLI } from "../utils/utils.js";
import { DosenRecord } from "../models/model-dosen.js";

const link =
  "http://dosen.unand.ac.id/web/pencarian?cari=&act=form&page=1&_pjax=%23w0-pjax&_tog1149016d=all&_pjax=%23w0-pjax";
const domain = "http://dosen.unand.ac.id";
const univname = "UNAND";

export async function scrapeUNAND() {
  return await withBrowser(async (page) => {
    await page.setJavaScriptEnabled(false);
    await page.goto(link, { waitUntil: "networkidle2" });
    await page.waitForSelector("table", { timeout: 10000 });

    const lecturersData = await page.$$eval(
      "#w0-container table tbody tr",
      (rows, passedUnivName, passedDomain) => {
        return rows
          .map((row) => {
            const cells = row.querySelectorAll("td");

            // Safety check: ensure it's a valid data row
            if (cells.length < 5) return null;

            // FIX 1: Use querySelector (singular) to get the actual DOM element
            const anchor = cells[1].querySelector("a");

            // FIX 2: Safely extract text and href in case the <a> tag is missing
            const namaLengkap = anchor
              ? anchor.innerText.trim()
              : cells[1].innerText.trim();
            const href = anchor ? anchor.getAttribute("href") : "";
            const link = href ? passedDomain + href.trim() : "";
            const jabatan = cells[2].innerText.trim();
            const fakultas = cells[4].innerText.trim();
            const prodi = cells[5].innerText.trim();

            return {
              fullname: namaLengkap,
              nama: namaLengkap
                .replace(/^(?:[a-zA-Z]+\.\s*)+|(?:,.*)$/g, "")
                .trim(),
              fakultas: fakultas,
              prodi: prodi,
              link: link,
              jabatan: jabatan,
              univ: passedUnivName,
            };
          })
          .filter((row) => row !== null);
      },
      univname,
      domain,
    );

    // 3. Transform the raw data into your standardized class
    return lecturersData.map((item) => new DosenRecord(item));
  });
}

// Reusable CLI execution
runCLI(import.meta.url, scrapeUNAND, univname);
