const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = []; const richieste = []; const inviati = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.route('**/rest/v1/**', async (route) => {
    const r = route.request();
    richieste.push(r.method() + ' ' + r.url().split('/rest/v1/')[1]);
    if (r.method() === 'POST'){ inviati.push(JSON.parse(r.postData())); return route.fulfill({status:201, body:''}); }
    route.fulfill({status:200, contentType:'application/json',
      body: JSON.stringify([{name:'Proto',score:9000,lines:40,quads:3,level:5,day:20260829}])});
  });
  await p.goto(PAGINA);
  await p.waitForTimeout(1300);
  await p.evaluate(async () => {
    document.getElementById('nameInput').value = 'Francesco';
    document.getElementById('dailyBtn').click();
    await new Promise(r => setTimeout(r, 300));
    const B = window.__baseline;
    B.setScore(1234);
    B.over();
    await new Promise(r => setTimeout(r, 400));
    document.getElementById('submitScore')?.click();
    await new Promise(r => setTimeout(r, 700));
  });
  console.log('richieste:'); richieste.forEach(r => console.log('  ' + r));
  console.log('inviato:', JSON.stringify(inviati));
  console.log('nome in memoria:', await p.evaluate(() => localStorage.getItem('agf.giocatore')));
  console.log('errori:', errors.length ? errors : 'nessuno');
  await b.close();
})();
