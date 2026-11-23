import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The original site built llms.txt and JSON-LD from a Sanity CMS.
// This copy has no CMS, so llms.txt is written from the text below.
const LLMS_TXT = `# Achraf (h7p5)
> A 3D portfolio with a few things I made.

## Projects
- [Chess Engine](https://h7p5.github.io/chess-engine/): a chess engine in plain JavaScript (minimax, alpha-beta, web worker).
- [Fire-fighting robot](https://github.com/h7p5/fire-fighting-robot): an Arduino robot that finds a flame and puts it out.
- [Insta Uploader](https://github.com/h7p5/insta-uploader): a Python desktop app for uploading Stories, Reels and Posts.

## Links
- GitHub: https://github.com/h7p5
- Instagram: https://www.instagram.com/h_7p5/
- X: https://x.com/h7p_5
- Reddit: https://www.reddit.com/user/Quiet-Disaster4904/
`;

export function sitePages() {
    let outDir = 'dist';
    return {
        name: 'site-pages',
        configResolved(config) {
            outDir = config.build.outDir;
        },
        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'llms.txt', source: LLMS_TXT });
        },
        // GitHub Pages has no rewrites: serve the app for /about, /gallery, ... via 404.html
        closeBundle() {
            copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
        },
    };
}
