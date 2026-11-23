// Renders story.html to a 1080x1920 PNG (story.png)
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'story.html'));
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(__dirname, 'story.png');
  await (await page.$('.story')).screenshot({ path: out });
  console.log(out);
  await browser.close();
})();
