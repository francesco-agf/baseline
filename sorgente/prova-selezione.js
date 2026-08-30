const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const casi = [
    ['baseline', PAGINA, ['#field', '.overlay', '.hud-strip', '.pad button', '.board-list', '#nameInput', '.share-box', '.modal-sheet']],
    ['refusi',   PAGINA, ['#field', '.overlay', '.hud-strip', '.pad button', '#nameInput', '.modal-sheet']]
  ];
  for (const [nome, url, sel] of casi){
    const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore','Collaudo'); } catch(e){} });
    await p.route('**/rest/v1/**', r => r.fulfill({status:200, contentType:'application/json', body:'[]'}));
    await p.goto(url);
    await p.waitForTimeout(1000);
    const out = await p.evaluate((sels) => {
      const r = {};
      for (const s of sels){
        const el = document.querySelector(s);
        r[s] = el ? getComputedStyle(el).webkitUserSelect || getComputedStyle(el).userSelect : 'assente';
      }
      r['callout body'] = getComputedStyle(document.body).webkitTouchCallout || '—';
      return r;
    }, sel);
    console.log(nome, JSON.stringify(out, null, 0));

    // prova pratica: selezionare tutto e vedere se prende il campo di gioco
    const testo = await p.evaluate(() => {
      const r = document.createRange();
      r.selectNodeContents(document.querySelector('.stage') || document.body);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      return (window.getSelection().toString() || '').trim().slice(0, 60);
    });
    console.log('  selezione sul campo:', testo ? JSON.stringify(testo) : '(vuota)');
    await p.close();
  }
  await b.close();
})();
