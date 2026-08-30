const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/rest/v1/**', r => r.fulfill({status:200, contentType:'application/json', body:'[]'}));
  await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore','Collaudo'); } catch(e){} });
  await p.goto(PAGINA);
  await p.waitForTimeout(1200);

  const vuota = `const g=B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;`;

  const r = await p.evaluate(async () => {
    const B = window.__baseline;
    const out = {};
    const svuota = () => { const g=B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null; };
    const attendi = async (ms) => new Promise(r => setTimeout(r, ms));

    // --- punteggio di una riga singola su riga NON guida (13) ---
    B.start('free'); svuota();
    for (let x = 1; x < 12; x++) B.state().grid[13][x] = 'T';
    B.force('I'); B.rotate(); for (let i=0;i<8;i++) B.move(-1);
    let s0 = B.state().score; B.hardDrop(); await attendi(600);
    out['riga (100 + battuta secca)'] = B.state().score - s0;

    // --- riga su guida (15 = linea di base) ---
    B.start('free'); svuota();
    for (let x = 1; x < 12; x++) B.state().grid[15][x] = 'T';
    B.force('I'); B.rotate(); for (let i=0;i<8;i++) B.move(-1);
    s0 = B.state().score; B.hardDrop(); await attendi(600);
    out['riga su guida (100+150)'] = B.state().score - s0;

    // --- quadricromia ---
    B.start('free'); svuota();
    for (let y = 13; y < 17; y++) for (let x = 1; x < 12; x++) B.state().grid[y][x] = 'T';
    B.force('I'); B.rotate(); for (let i=0;i<8;i++) B.move(-1);
    s0 = B.state().score; B.hardDrop(); await attendi(1000);
    out['C+M+Y+K (800 + guida 15 + battuta)'] = B.state().score - s0;
    out['campione in arrivo'] = B.anteprima()[0];

    // --- gradi ---
    const gradi = {};
    for (const v of [0, 1999, 2000, 6000, 12000, 25000, 45000, 80000]){
      B.setScore(v); gradi[v] = document.getElementById('grade').textContent;
    }
    out['gradi'] = gradi;

    // --- corpo ogni dieci righe ---
    B.start('free');
    const corpi = {};
    for (const lv of [1,2,6,10]){ B.setLevel(lv); corpi[lv] = document.getElementById('corpo').textContent; }
    out['corpo per livello'] = corpi;

    // --- attrezzi: cinque celle e ruotabili? ---
    const att = {};
    for (const k of ['X','Y','W']){
      const c = B.PIECES[k].cells;
      att[B.PIECES[k].name] = { celle: c.flat().filter(Boolean).length, ruotabile: !B.PIECES[k].nonRuota };
    }
    out['attrezzi'] = att;
    out['barra ruotabile'] = !B.PIECES.B.nonRuota;
    out['barra celle'] = B.PIECES.B.cells.flat().filter(Boolean).length;

    // --- tenuta: campione, attrezzo, segno, barra ---
    const tenuta = {};
    for (const k of ['O','X','q','B']){
      B.start('free'); B.force(k); B.doHold();
      tenuta[k] = B.state().cur.key === k ? 'bloccata' : 'permessa';
    }
    out['tenuta'] = tenuta;

    // --- righe guida ---
    out['guide'] = B.GUIDE_ROWS;

    // --- partita libera non entra in classifica ---
    B.start('free'); B.setScore(500); B.over(); await attendi(400);
    out['libera: iscrizione visibile'] = !document.getElementById('signup').hidden;
    B.start('daily'); B.setScore(500); B.over(); await attendi(400);
    out['giornaliera: iscrizione visibile'] = !document.getElementById('signup').hidden;

    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  console.log('errori:', errs.length ? errs : 'nessuno');
  await b.close();
})();
