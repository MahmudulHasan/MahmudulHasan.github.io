// Renders cv/resume.html to assets/Mahmudul_Hasan_Resume.pdf
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(dir, 'resume.html')).href);
await page.pdf({ path: path.join(dir, '..', 'assets', 'Mahmudul_Hasan_Resume.pdf'), format: 'Letter', preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('CV written to assets/Mahmudul_Hasan_Resume.pdf');
