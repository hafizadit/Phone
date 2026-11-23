// Renders story.html -> story.png, or with --all every variants/*.html -> variants/*.png
// plus a side-by-side contact sheet (variants/_sheet.png).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const shoot = async (html, png) => {
    await page.goto('file://' + html);
    await page.evaluate(() => document.fonts.ready);
    await (await page.$('.story')).screenshot({ path: png });
    console.log(png);
  };
  if (process.argv.includes('--all')) {
    const dir = path.join(__dirname, 'variants');
    const names = fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
    for (const n of names) await shoot(path.join(dir, `${n}.html`), path.join(dir, `${n}.png`));
    const cells = names.map(n => `<figure><img src="${n}.png"><figcaption>${n}</figcaption></figure>`).join('');
    const sheet = path.join(dir, '_sheet.html');
    fs.writeFileSync(sheet, `<!doctype html><style>body{margin:0;background:#fff;font:600 28px sans-serif}
      .g{display:grid;grid-template-columns:repeat(3,360px);gap:24px;padding:24px}figure{margin:0}
      img{width:360px;height:640px;display:block}figcaption{padding:8px 2px}</style><div class="g">${cells}</div>`);
    const p2 = await browser.newPage({ viewport: { width: 1176, height: 800 } });
    await p2.goto('file://' + sheet);
    await p2.screenshot({ path: path.join(dir, '_sheet.png'), fullPage: true });
    fs.unlinkSync(sheet);
    console.log(path.join(dir, '_sheet.png'));
  } else {
    await shoot(path.join(__dirname, 'story.html'), path.join(__dirname, 'story.png'));
  }
  await browser.close();
})();
