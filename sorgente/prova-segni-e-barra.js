const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const USCITA = path.resolve(__dirname, 'uscita');
require('fs').mkdirSync(USCITA, { recursive: true });
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
const log = (...a) => console.log(...a);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 940 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto(PAGINA);
  await page.waitForTimeout(1000);

  const svuota = `const g=B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;`;

  // A. capoverso: chiude la riga dove si posa anche se non e' piena
  const a = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    for (let x = 0; x < 5; x++) g[16][x] = 'T';
    const l0 = B.state().lines;
    B.force('q'); B.hardDrop();
    await new Promise(r => setTimeout(r, 700));
    const st = B.state();
    return { righe: st.lines - l0, celleResidue: st.grid.flat().filter(Boolean).length };
  });
  log('A. capoverso:', JSON.stringify(a), '(atteso 1 riga, 0 residue)');

  // B. taglierina: toglie la riga piu' alta
  const b = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    for (let x = 0; x < 4; x++){ g[10][x]='T'; g[11][x]='O'; g[12][x]='L'; }
    const prima = B.state().grid.flat().filter(Boolean).length;
    const s0 = B.state().score;
    B.force('r'); for (let i=0;i<8;i++) B.move(1); B.hardDrop();
    await new Promise(r => setTimeout(r, 500));
    const st = B.state();
    return { prima: prima, dopo: st.grid.flat().filter(Boolean).length, punti: st.score - s0,
             rigaAltaVuota: !st.grid[10].some(Boolean) };
  });
  log('B. taglierina:', JSON.stringify(b), '(prima 12+1 segno, dopo -4)');

  // C. legatura
  const c = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    B.force('g'); B.hardDrop();
    await new Promise(r => setTimeout(r, 400));
    const r = B.state().grid[16];
    return { riga: r.map(v => v ? v : '.').join(''), celle: r.filter(Boolean).length };
  });
  log('C. legatura:', JSON.stringify(c), '(attese 5 celle contigue)');

  // D. chiamata di nota: raddoppia la riga successiva
  const d = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    B.force('n'); for (let i=0;i<8;i++) B.move(-1); B.hardDrop();
    await new Promise(r => setTimeout(r, 300));
    const g2 = B.state().grid;
    for (let x = 1; x < 12; x++) g2[14][x] = 'T';
    const s0 = B.state().score;
    B.force('I'); B.rotate(); for (let i=0;i<8;i++) B.move(-1); B.hardDrop();
    await new Promise(r => setTimeout(r, 500));
    return { delta: B.state().score - s0, righe: B.state().lines };
  });
  log('D. chiamata di nota:', JSON.stringify(d), '(riga singola 100 -> 200 + battuta)');

  // E. la barra colore non ruota e si sposta
  const e = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    B.force('B');
    const f0 = JSON.stringify(B.state().cur.shape);
    B.rotate(); B.rotate();
    const f1 = JSON.stringify(B.state().cur.shape);
    const x0 = B.state().cur.x;
    B.move(-1); B.move(-1);
    const x1 = B.state().cur.x;
    B.hardDrop();
    await new Promise(r => setTimeout(r, 400));
    const riga = B.state().grid.map(r => r.filter(v => v === 'B').length).reduce((a,b)=>a+b,0);
    return { formaInvariata: f0 === f1, spostata: x0 - x1, celleSulFoglio: riga };
  });
  log('E. barra colore:', JSON.stringify(e), '(invariata true, spostata 2, 4 celle)');

  // F. bonus barra in registro
  const f = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    for (let x = 4; x < 12; x++) g[16][x] = 'T';
    const s0 = B.state().score;
    B.force('B'); for (let i=0;i<8;i++) B.move(-1); B.hardDrop();
    await new Promise(r => setTimeout(r, 600));
    return { delta: B.state().score - s0, righe: B.state().lines };
  });
  log('F. barra in registro:', JSON.stringify(f), '(100 + 250 bonus + battuta)');

  // G. i segni e la barra non si tengono da parte
  const g7 = await page.evaluate(() => {
    const B = window.__baseline; B.start('free');
    const out = {};
    for (const k of ['q','B']){ B.force(k); B.doHold(); out[k] = B.state().cur.key; }
    return out;
  });
  log('G. tenuta bloccata:', JSON.stringify(g7));

  // H. musica di macchina
  const h = await page.evaluate(async () => {
    const sel = document.getElementById('musicSel');
    const out = [];
    for (const v of ['heidelberg','mettifoglio','torchio','off']){
      sel.value = v; sel.dispatchEvent(new Event('change'));
      await new Promise(r => setTimeout(r, 350));
      out.push(v + ':' + sel.value);
    }
    return out.join(' ');
  });
  log('H. tracce:', h);

  // I. pausa dal pulsante
  const i9 = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const btn = document.getElementById('pauseBtn');
    const visibile = !btn.hidden;
    btn.click(); await new Promise(r => setTimeout(r, 80));
    const inPausa = B.state().phase + '/' + btn.textContent;
    btn.click(); await new Promise(r => setTimeout(r, 80));
    return { visibileInPartita: visibile, dopoClick: inPausa,
             dopoSecondo: B.state().phase + '/' + btn.textContent };
  });
  log('I. pausa:', JSON.stringify(i9));

  // J. invito
  const j = await page.evaluate(async () => {
    const b = document.getElementById('inviteBtn');
    b.click(); await new Promise(r => setTimeout(r, 250));
    return b.textContent;
  });
  log('J. invito ->', j);

  // K. partita lunga con tutte le novita'
  const k = await page.evaluate(async () => {
    const B = window.__baseline; B.start('daily');
    let n = 0;
    for (let i = 0; i < 400; i++){
      if (B.state().phase !== 'play') break;
      const m = Math.floor(Math.random()*9)-4;
      for (let j=0;j<Math.abs(m);j++) B.move(m>0?1:-1);
      for (let j=0;j<Math.floor(Math.random()*4);j++) B.rotate();
      B.hardDrop(); n++;
      await new Promise(r => setTimeout(r, 12));
    }
    return { pezzi: n, phase: B.state().phase, punti: B.state().score };
  });
  log('K. partita:', JSON.stringify(k));

  await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid; for(let y=0;y<17;y++) for(let x=0;x<12;x++) g[y][x]=null;
    for (let x = 0; x < 12; x++){ if (x%3) g[16][x]='T'; if (x%4) g[15][x]='O'; }
    g[14][2]='q'; g[14][3]='r'; g[14][5]='g'; g[14][6]='n';
    for (let x=7;x<11;x++) g[13][x]='B';
    B.force('B');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(USCITA, 's-segni.png') });

  log('L. errori:', errors.length ? errors : 'nessuno');
  await browser.close();
})();
