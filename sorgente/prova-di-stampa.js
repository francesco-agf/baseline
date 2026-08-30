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
  page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto(PAGINA);
  await page.waitForTimeout(1200);

  // una partita con qualche riga stampata, poi game over
  await page.evaluate(async () => {
    const B = window.__baseline; B.start('daily');
    const g = B.state().grid;
    for (let r = 0; r < 5; r++){
      for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
      for (let y = 13; y < 17; y++) for (let x = 1; x < 12; x++) g[y][x] = ['T','O','L','I','J','S','Z'][(x+y+r)%7];
      B.force('I'); B.rotate(); for (let i=0;i<8;i++) B.move(-1); B.hardDrop();
      await new Promise(r2 => setTimeout(r2, 700));
    }
    B.over();
  });
  await page.waitForTimeout(600);
  const stato = await page.evaluate(() => ({
    righe: window.__baseline.state().lines,
    stampate: window.__baseline.state().printed.length,
    box: !document.getElementById('scarica').hidden
  }));
  console.log('stato:', JSON.stringify(stato));

  // JPEG
  const dl1 = page.waitForEvent('download', { timeout: 30000 });
  await page.click('#dlJpg');
  const d1 = await dl1;
  await d1.saveAs(path.join(USCITA, 'prova-foglio.jpg'));
  console.log('jpeg:', d1.suggestedFilename(), fs.statSync(path.join(USCITA, 'prova-foglio.jpg')).size, 'byte');

  // GIF
  const t0 = Date.now();
  const dl2 = page.waitForEvent('download', { timeout: 90000 });
  await page.click('#dlGif');
  const d2 = await dl2;
  await d2.saveAs(path.join(USCITA, 'prova-foglio.gif'));
  console.log('gif:', d2.suggestedFilename(), fs.statSync(path.join(USCITA, 'prova-foglio.gif')).size, 'byte,',
              ((Date.now()-t0)/1000).toFixed(1)+'s');

  console.log('errori:', errors.length ? errors : 'nessuno');
  await browser.close();
})();
