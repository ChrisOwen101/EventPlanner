import fs from 'fs/promises';
import axios from 'axios';

async function main() {
    const fileContent = await fs.readFile('./example.txt', 'utf-8');
    const urls = fileContent.split('\n').map(u => u.trim()).filter(Boolean);

    for (const url of urls) {
        try {
            const { data } = await axios.get(url);
            console.log(data)
            const ogMatch = data.match(/<meta\s+(?:property="og:image"\s+content|name="twitter:image"\s+content)="([^"]+)"/i);
            console.log(ogMatch)
            console.log(`${url},${ogMatch ? ogMatch[1] : 'No image found'}`);
        } catch (e) {
            // console.log(e.message);
            // console.log(`${url},Error fetching`);
        }
    }
}

main().catch(() => console.error('Failed to fetch images'));
