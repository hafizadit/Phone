// Renders each .poster in template.html (or the file given as argv[2]) to PNG
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const src = path.resolve(__dirname, process.argv[2] || 'template.html');
  const base = src.replace(/\.html$/, '');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + src);
  await page.evaluate(() => document.fonts.ready);
  const posters = await page.$$('.poster');
  for (let i = 0; i < posters.length; i++) {
    const file = posters.length > 1 ? `${base}-${i + 1}.png` : `${base}.png`;
    await posters[i].screenshot({ path: file });
    console.log(file);
  }
  await browser.close();
})();
