import { withBrowser, runCLI } from '../utils/utils.js';
import { DosenRecord } from '../models/model-dosen.js';

const link = 'https://ppid.ubb.ac.id/tentang/pegawai_ubb/';
const univname = 'UBB';

export async function scrapeUBB() {
    return await withBrowser(async (page) => {
        await page.setJavaScriptEnabled(false); 
        await page.goto(link, { waitUntil: 'networkidle2' });
        await page.waitForSelector('table', { timeout: 10000 });

        const lecturersData = await page.$$eval('#example tbody tr', (rows, passedUnivName) => {
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                
                // Safety check: skip rows that don't have enough columns
                if (cells.length < 5) return null;

                const namaLengkap = cells[1].textContent?.trim() || ""; 
                const unitKerja = cells[2].textContent?.trim();   
                const posisi = cells[3].textContent?.trim();      
                const jabatan = cells[4].textContent?.trim();     

                return {
                    fullname: namaLengkap,
                    nama: namaLengkap.replace(/^(?:[a-zA-Z]+\.\s*)+|(?:,.*)$/g, '').trim(), 
                    prodi: unitKerja, 
                    posisi: posisi,
                    jabatan: jabatan,
                    univ: passedUnivName 
                };
            }).filter(row => row !== null);
        }, univname);
        
        // 3. Transform the raw data into your standardized class
        return lecturersData.map(item => new DosenRecord(item));
    });
}

// Reusable CLI execution
runCLI(import.meta.url, scrapeUBB, univname);