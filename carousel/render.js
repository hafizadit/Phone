// Renders each .slide in carousel.html to a 1080x1350 PNG in ./png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const out = path.join(__dirname, 'png');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.join(__dirname, 'carousel.html'));
  await page.evaluate(() => document.fonts.ready);
  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const file = path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: file });
    console.log(file);
  }
  await browser.close();
})();
