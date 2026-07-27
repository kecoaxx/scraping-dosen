import { withBrowser, runCLI } from "../utils/utils.js";
import { DosenRecord } from "../models/model-dosen.js";

const link = "https://...";
const univname = "TEMPLATE";

export async function scrapeTEMPLATE() {
  return await withBrowser(async (page) => {
    const data;

    /**
     * Add logics for it to be returned according to DosenRecord Class.
     * Ideally, the only exported function from a scraper is only this one.
     * If there is a need of another functions, and that function can
     * help another scraper, you can put it in utils.js. If not,
     * you can just put it here.
     *
     */

    return data.map((item) => new DosenRecord(item));
  });
}

// Reusable CLI execution
runCLI(import.meta.url, scrapeTEMPLATE, univname);
