import fs from 'fs/promises';
import axios from 'axios';

async function main() {
    const fileContent = await fs.readFile('./urls.txt', 'utf-8');
    const urls = fileContent.split('\n').map(u => u.trim()).filter(Boolean);
    const results = [];

    for (const url of urls) {
        try {
            const { data } = await axios.get(url);
            const regex = /<meta\s+(?:property="og:image"\s+content|name="twitter:image"\s+content|itemprop="image"\s+content)="([^"]+)"/i;
            const ogMatch = data.match(regex);
            results.push(ogMatch ? ogMatch[1] : 'No image found');
        } catch {
            results.push('Error fetching');
        }
    }

    await fs.writeFile('./output.txt', results.join('\n'));
}

main().catch(() => console.error('Failed to fetch images'));
