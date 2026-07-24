import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function saveJSON(data, filename) {
    try {
        // 2. Build the path relative to THIS script file
        // If this script is in /src, this creates /temp next to /src
        const dirPath = path.join(__dirname, '../temp');
        
        // Create the directory if it doesn't exist
        await fs.mkdir(dirPath, { recursive: true });
        
        const jsonString = JSON.stringify(data, null, 2);
        
        // 3. Write the file using path.join for safety across OS (Windows/Mac/Linux)
        const filePath = path.join(dirPath, `${filename}.json`);
        await fs.writeFile(filePath, jsonString, 'utf8');
        
        console.log(`${filename}.json saved successfully at ${filePath}`);
    } catch (err) {
        console.error('Error writing file:', err);
    }
}