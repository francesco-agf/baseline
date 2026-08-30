const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const USCITA = path.resolve(__dirname, 'uscita');
require('fs').mkdirSync(USCITA, { recursive: true });
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = []; const inviati = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type()==='error' && !/ERR_|fonts.g/.test(m.text())) errors.push(m.text()); });
  await p.route('**/rest/v1/**', route => {
    const r = route.request();
    if (r.method()==='POST'){ inviati.push(JSON.parse(r.postData())); return route.fulfill({status:201, body:''}); }
    route.fulfill({status:200, contentType:'application/json', body:'[]'});
  });
  await p.goto(PAGINA);
  await p.waitForTimeout(1300);

  const t = await p.evaluate(async () => {
    document.getElementById('nameInput').value = 'Collaudo';
    document.getElementById('dailyBtn').click();
    await new Promise(r => setTimeout(r, 300));
    const B = window.__baseline;
    for (let i = 0; i < 4; i++){ B.hardDrop(); await new Promise(r => setTimeout(r, 60)); }
    const g = document.getElementById('giveUpBtn');
    const primaDellaPausa = g.hidden;
    B.state(); // no-op
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    await new Promise(r => setTimeout(r, 200));
    const inPausa = { fase: B.state().phase, pulsante: !g.hidden, testo: g.textContent };
    g.click();
    await new Promise(r => setTimeout(r, 500));
    return { primaDellaPausa: primaDellaPausa, inPausa: inPausa,
             dopo: { fase: B.state().phase, pulsante: g.hidden,
                     specimen: !document.getElementById('specimen').hidden,
                     scarica: !document.getElementById('scarica').hidden,
                     titolo: document.getElementById('ovKicker').textContent } };
  });
  console.log(JSON.stringify(t, null, 1));
  console.log('punteggio inviato:', JSON.stringify(inviati));

  // riprendere dopo la pausa deve nascondere il pulsante
  const t2 = await p.evaluate(async () => {
    const B = window.__baseline;
    document.getElementById('dailyBtn').click();
    await new Promise(r => setTimeout(r, 300));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    await new Promise(r => setTimeout(r, 150));
    const a = !document.getElementById('giveUpBtn').hidden;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    await new Promise(r => setTimeout(r, 150));
    return { inPausa: a, dopoRipresa: document.getElementById('giveUpBtn').hidden, fase: B.state().phase };
  });
  console.log('ripresa:', JSON.stringify(t2));

  await p.evaluate(async () => {
    document.getElementById('dailyBtn').click();
    await new Promise(r => setTimeout(r, 300));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
  });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(USCITA, 'pausa.png'), clip: { x: 320, y: 90, width: 640, height: 800 } });
  console.log('errori:', errors.length ? errors : 'nessuno');
  await b.close();
})();
