const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const USCITA = path.resolve(__dirname, 'uscita');
require('fs').mkdirSync(USCITA, { recursive: true });
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 940 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errors.push(m.text()); });
  await page.goto(PAGINA);
  await page.waitForTimeout(1100);

  async function caso(nome, righeDaFare){
    await page.evaluate(async (nr) => {
      const B = window.__baseline; B.start('free');
      const g = B.state().grid;
      for (let r = 0; r < nr; r++){
        for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
        for (let x = 1; x < 12; x++) g[16][x] = ['T','O','L','I','J','S','Z'][(x+r)%7];
        B.force('I'); B.rotate(); for (let i=0;i<8;i++) B.move(-1); B.hardDrop();
        await new Promise(r2 => setTimeout(r2, 320));
      }
      B.over();
    }, righeDaFare);
    await page.waitForTimeout(500);
    const d1 = page.waitForEvent('download', { timeout: 30000 });
    await page.click('#dlJpg');
    const f1 = await d1; await f1.saveAs(path.join(USCITA, 'caso-' + nome + '.jpg'));
    const d2 = page.waitForEvent('download', { timeout: 60000 });
    await page.click('#dlGif');
    const f2 = await d2; await f2.saveAs(path.join(USCITA, 'caso-' + nome + '.gif'));
    console.log(nome, 'jpg', fs.statSync(path.join(USCITA, 'caso-'+nome+'.jpg')).size,
                'gif', fs.statSync(path.join(USCITA, 'caso-'+nome+'.gif')).size);
  }
  await caso('vuoto', 0);
  await caso('lungo', 24);
  console.log('errori:', errors.length ? errors : 'nessuno');
  await browser.close();
})();
