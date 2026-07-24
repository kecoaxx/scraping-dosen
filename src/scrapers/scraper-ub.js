import { withBrowser, runCLI } from '../utils/utils.js';
import { DosenRecord } from '../models/model-dosen.js';

const link = 'https://www.ub.ac.id/id/directory/direktori-dosen/';
const univname = "UB";

export async function scrapeUB() {
    return await withBrowser(async (page) => {
        await page.goto(link, { waitUntil: 'networkidle2' });
        
        const fullXPath = '/html/body/div[8]/main/div/div/div/div[2]/div/div[1]/div/div[2]/div/div';
        const xpathSelector = `::-p-xpath(${fullXPath})`;
        
        await page.waitForSelector(xpathSelector, { timeout: 10000 });
        
        const lecturersData = await page.$$eval(xpathSelector, (elements, passedUnivName) => {
            return elements.map(el => ({
                fullname: el.dataset.fullname?.trim(),
                nama: el.dataset.nama?.trim(),
                fakultas: el.dataset.homebase?.trim(),
                prodi: el.dataset.satker?.trim(),
                foto: el.dataset.foto?.trim(),
                gelarProf: el.dataset.gelar_prof?.trim(),
                gelarDepan: el.dataset.gelar_depan?.trim(),
                gelarBelakang: el.dataset.gelar_belakang?.trim(),
                univ: passedUnivName
            }));
        }, univname);
        
        return lecturersData.map(item => new DosenRecord(item));
    });
}

// Reusable CLI execution
runCLI(import.meta.url, scrapeUB, univname);