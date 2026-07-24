import { spawn } from 'child_process';

// process.argv[2] grabs the "ub" from "pnpm scrape ..."
const target = process.argv[2]; 

if (!target) {
    console.error("❌ Please provide a target. Example: pnpm scrape ub");
    process.exit(1);
}

const fileName = `scraper-${target}.js`;
console.log(`🚀 Starting scraper: ${fileName}...\n`);

// This runs the exact file in the correct directory, passing the output to your terminal
spawn('node', [`src/scrapers/${fileName}`], { stdio: 'inherit' });