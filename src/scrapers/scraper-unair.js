import { withBrowser, runCLI } from "../utils/utils.js";
import { DosenRecord } from "../models/model-dosen.js";

const link = "https://unair.ac.id/dosen-dan-staf/";
const univname = "UNAIR";

export async function scrapeUNAIR() {
  return await withBrowser(async (page) => {
    await page.setJavaScriptEnabled(false);
    await page.goto(link, { waitUntil: "networkidle2" });
    await page.waitForSelector("table", { timeout: 10000 });

    const lecturersData = await page.$$eval(
      "#tablepress-318 tbody tr",
      (rows, passedUnivName) => {
        return rows
          .map((row) => {
            const cells = row.querySelectorAll("td");

            const namaLengkap = cells[1].innerText.trim();
            const fakultas = cells[2].innerText.trim();
            const prodi = cells[3].innerText.trim();
            const email = cells[4].innerText.trim();

            console.log("namaLengkap", namaLengkap);

            return {
              fullname: namaLengkap,
              nama: namaLengkap
                .replace(/^(?:[a-zA-Z]+\.\s*)+|(?:,.*)$/g, "")
                .trim(),
              fakultas: fakultas,
              prodi: prodi,
              email: email,
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
runCLI(import.meta.url, scrapeUNAIR, univname);
I(import.meta.url, scrapeUNAIR, univname);
