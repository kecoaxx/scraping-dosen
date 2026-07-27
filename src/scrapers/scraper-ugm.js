import { withBrowser, runCLI } from '../utils/utils.js';
import { DosenRecord } from '../models/model-dosen.js';

const link = 'https://acadstaff.ugm.ac.id/';
const univname = 'UGM';

export async function scrapeUGM() {
    return await withBrowser(async (page) => {
        
        // ==========================================
        // PHASE 1: Harvest all Profile URLs (Unchanged)
        // ==========================================
        await page.goto(link, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.faculty-link', { timeout: 10000 });
        
        const faculties = await page.$$eval('.faculty-link', (elements) => {
            return elements.map(el => ({
                nama: el.textContent?.trim(),
                link: el.href
            }));
        });

        console.log(`Found ${faculties.length} faculties. Collecting profile URLs...`);

        const profileUrls = [];

        for (const faculty of faculties) {
            let n = 1;
            console.log('faculty: ', faculty.nama);
            
            while (true) {
                const postUrl = faculty.link.replace('/faculty/', `/pagfaculty/${n}/`);
                
                const responseData = await page.evaluate(async (url) => {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    });
                    return await res.json();
                }, postUrl);

                if (!responseData || !responseData.result || responseData.result.length === 0) {
                    break;
                }

                const links = await page.evaluate((htmlArray) => {
                    const parser = new DOMParser();
                    return htmlArray.map(htmlString => {
                        const doc = parser.parseFromString(htmlString, 'text/html');
                        const aTag = doc.querySelector('a');
                        return aTag ? aTag.href : null;
                    }).filter(href => href !== null);
                }, responseData.result);

                profileUrls.push(...links);
                n++;
            }
        }

        const uniqueProfileUrls = [...new Set(profileUrls)];
        console.log(`Collected ${uniqueProfileUrls.length} profile URLs. Starting parallel extraction...`);

        // ==========================================
        // PHASE 2: Parallel Deep Extraction
        // ==========================================
        const allLecturers = [];
        
        // 1. Get the browser instance from the page provided by your wrapper
        const browser = page.browser();
        
        // 2. Define how many tabs to open simultaneously
        const MAX_CONCURRENCY = 32; 
        
        // 3. Shared counter to act as our queue
        let currentIndex = 0;

        // 4. Define the worker function
        const worker = async (workerId) => {
            // Open a dedicated tab for this worker
            const workerPage = await browser.newPage();
            
            // OPTIONAL BUT HIGHLY RECOMMENDED: Block images/CSS to drastically speed up loading
            await workerPage.setRequestInterception(true);
            workerPage.on('request', (req) => {
                if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Keep grabbing URLs until the queue is empty
            while (currentIndex < uniqueProfileUrls.length) {
                // Grab the next index and immediately increment so other workers don't grab it
                const index = currentIndex++;
                const profileUrl = uniqueProfileUrls[index];
                
                console.log(`[Worker ${workerId}] Scraping (${index + 1}/${uniqueProfileUrls.length}): ${profileUrl}`);

                try {
                    await workerPage.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

                    const lecturerData = await workerPage.evaluate((currentUrl, passedUnivName) => {
                        const nameEl = document.querySelector('h4.fw-bold.text-darkblue');
                        const fullname = nameEl ? nameEl.textContent.trim() : "";

                        let fakultas = "";
                        const hstacksfaculty = Array.from(document.querySelectorAll('.profile-info .hstack'));
                        const buildingDiv = hstacksfaculty.find(el => el.querySelector('.bi-building'));
                        if (buildingDiv) fakultas = buildingDiv.textContent.trim();

                        let prodi = "";
                        const pEl = document.querySelector('.profile-info p.text-dark');
                        if (pEl) {
                            const parts = pEl.textContent.split('/');
                            prodi = parts.length >= 3 ? parts[2].trim() : parts[parts.length - 1].trim();
                        }

                        let email = "";
                        const linkDiv = hstacksfaculty.find(el => el.querySelector('.bi-link')); // Reused hstacks array
                        if (linkDiv) email = linkDiv.textContent.trim();

                        return {
                            fullname: fullname,
                            nama: fullname.replace(/^(?:[a-zA-Z]+\.\s*)+|(?:,.*)$/g, '').trim(), 
                            fakultas: fakultas,
                            prodi: prodi,
                            email: email,
                            link: currentUrl,
                            univ: passedUnivName
                        };
                    }, profileUrl, univname);

                    allLecturers.push(lecturerData);

                } catch (err) {
                    console.error(`[Worker ${workerId}] Failed to scrape ${profileUrl}:`, err.message);
                }
            }
            
            // Clean up the tab when the queue is finished
            await workerPage.close();
        };

        // 5. Spawn the workers
        const workers = [];
        for (let i = 0; i < MAX_CONCURRENCY; i++) {
            workers.push(worker(i + 1));
        }

        // 6. Wait for all workers to finish their loops
        await Promise.all(workers);
        
        console.log(`Finished scraping ${allLecturers.length} lecturers.`);

        // 3. Transform the aggregated raw data
        return allLecturers.map(item => new DosenRecord(item));
    });
}

runCLI(import.meta.url, scrapeUGM, univname);