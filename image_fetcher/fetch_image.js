import fs from 'fs/promises';
import axios from 'axios';

async function main() {
    const fileContent = await fs.readFile('./example.csv', 'utf-8');
    const lines = fileContent.split('\n');
    const header = lines[0].split(',');
    const urlIndex = header.indexOf('URL');
    if (urlIndex === -1) return console.error('No URL column found');

    const newHeader = [...header, 'IMAGE'];
    const updatedLines = [newHeader.join(',')];
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length <= urlIndex) continue;

        let imageUrl = '';
        try {
            const { data } = await axios.get(row[urlIndex]);
            const ogMatch = data.match(/<meta\s+(?:property="og:image"\s+content|name="twitter:image"\s+content)="([^"]+)"/i);
            imageUrl = ogMatch ? ogMatch[1] : 'No image found';
        } catch {
            imageUrl = 'Error fetching';
        }
        row.push(imageUrl);
        updatedLines.push(row.join(','));
        results.push(imageUrl);
    }

    await fs.writeFile('./example.csv', updatedLines.join('\n'));
    await fs.writeFile('./output.txt', results.join('\n'));
}

main().catch(() => console.error('Failed to fetch images'));
