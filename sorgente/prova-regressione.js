const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
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

  // 1. determinismo della composizione del giorno
  const t1 = await page.evaluate(() => {
    const a = window.__baseline.seedPeek('daily');
    const b = window.__baseline.seedPeek('daily');
    const c = window.__baseline.seedPeek('free');
    return { daily1: a, daily2: b, uguali: a === b, liberaDiversa: a !== c };
  });
  log('1. seed giornaliero:', JSON.stringify(t1));

  // 2. quadricromia: 4 righe in un colpo
  const t2 = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid;
    for (let y = 0; y < 17; y++) for (let x = 0; x < 12; x++) g[y][x] = null;
    for (let y = 13; y < 17; y++) for (let x = 1; x < 12; x++) g[y][x] = 'T';
    B.force('I'); B.rotate();                   // asta verticale
    for (let i = 0; i < 8; i++) B.move(-1);
    const s0 = B.state().score;
    B.hardDrop();
    await new Promise(r => setTimeout(r, 950));
    const st = B.state();
    return { lines: st.lines, quads: st.quads, delta: st.score - s0, eventi: st.events, stampate: st.printed.length };
  });
  log('2. quadricromia:', JSON.stringify(t2));

  // 3. combo su due scarichi consecutivi
  const t3 = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid;
    for (let y = 0; y < 17; y++) for (let x = 0; x < 12; x++) g[y][x] = null;
    for (let x = 1; x < 12; x++) { g[16][x] = 'T'; }
    B.force('I'); B.rotate(); for (let i = 0; i < 8; i++) B.move(-1);  // asta verticale in colonna 0
    B.hardDrop();
    await new Promise(r => setTimeout(r, 350));
    const c1 = B.state().combo;
    const g2 = B.state().grid;
    for (let x = 1; x < 12; x++) g2[16][x] = 'T';
    B.force('I'); B.rotate(); for (let i = 0; i < 8; i++) B.move(-1);
    B.hardDrop();
    await new Promise(r => setTimeout(r, 350));
    return { comboDopo1: c1, comboDopo2: B.state().combo, righe: B.state().lines };
  });
  log('3. combo:', JSON.stringify(t3));

  // 4. Comic Sans: malus mentre e' in campo, bonus quando lo stampi
  const t4 = await page.evaluate(async () => {
    const B = window.__baseline; B.start('free');
    const g = B.state().grid;
    for (let y = 0; y < 17; y++) for (let x = 0; x < 12; x++) g[y][x] = null;
    B.force('O', true);
    const cursed = B.state().cur.cursed;
    B.hardDrop();
    await new Promise(r => setTimeout(r, 200));
    const s0 = B.state().score;                    // dopo la battuta, prima del malus
    await new Promise(r => setTimeout(r, 2400));   // due tick di malus, nessun input
    const s1 = B.state().score;
    const uiMalus = document.getElementById('curseRow').classList.contains('on');
    // completa le righe che contengono celle maledette
    const g2 = B.state().grid;
    const righe = [];
    g2.forEach((r, i) => { if (r.some(c => c && c.length > 1)) righe.push(i); });
    for (const y of righe) for (let x = 0; x < 12; x++) if (!g2[y][x]) g2[y][x] = 'T';
    const s2 = B.state().score;
    B.force('T');
    B.hardDrop();
    await new Promise(r => setTimeout(r, 500));
    return { pezzoMaledetto: cursed, malus: s1 - s0, indicatoreUi: uiMalus,
             bonusEsorcismo: B.state().score - s2, righe: B.state().lines,
             maledizioneRimossa: !B.state().grid.some(r => r.some(c => c && c.length > 1)) };
  });
  log('4. Comic Sans:', JSON.stringify(t4));

  // 5. gradi
  const t5 = await page.evaluate(() => {
    const B = window.__baseline;
    const out = {};
    for (const v of [0, 3000, 13000, 50000, 999999]) {
      B.setScore(v);
      out[v] = document.getElementById('grade').textContent;
    }
    return out;
  });
  log('5. gradi:', JSON.stringify(t5));

  // 6. cambio carattere per corpo
  const t6 = await page.evaluate(() => {
    const B = window.__baseline; B.start('free');
    const out = {};
    for (const lv of [1, 3, 4, 6, 7, 10]) {
      B.setLevel(lv);
      out[lv] = document.getElementById('carattere').textContent + ' / ' +
                document.getElementById('corpo').textContent;
    }
    return out;
  });
  log('6. carattere per corpo:', JSON.stringify(t6));

  // 7. testo condivisibile
  const t7 = await page.evaluate(async () => {
    const B = window.__baseline; B.start('daily');
    const g = B.state().grid;
    for (let y = 0; y < 17; y++) for (let x = 0; x < 12; x++) g[y][x] = null;
    for (let y = 13; y < 17; y++) for (let x = 1; x < 12; x++) g[y][x] = 'T';
    B.force('I'); B.rotate(); for (let i = 0; i < 8; i++) B.move(-1);
    B.hardDrop();
    await new Promise(r => setTimeout(r, 400));
    const g2 = B.state().grid;
    for (let x = 1; x < 12; x++) g2[15][x] = 'T';
    B.force('I'); B.rotate(); for (let i = 0; i < 8; i++) B.move(-1);
    B.hardDrop();
    await new Promise(r => setTimeout(r, 400));
    B.over();
    return B.shareText();
  });
  log('7. blocchetto condivisibile:\n' + t7);

  // 8. partita lunga
  const t8 = await page.evaluate(async () => {
    const B = window.__baseline; B.start('daily');
    let n = 0;
    for (let i = 0; i < 300; i++) {
      if (B.state().phase !== 'play') break;
      const m = Math.floor(Math.random() * 9) - 4;
      for (let j = 0; j < Math.abs(m); j++) B.move(m > 0 ? 1 : -1);
      for (let j = 0; j < Math.floor(Math.random() * 4); j++) B.rotate();
      B.hardDrop(); n++;
      await new Promise(r => setTimeout(r, 14));
    }
    const st = B.state();
    return { pezzi: n, phase: st.phase, punti: st.score, righe: st.lines };
  });
  log('8. partita:', JSON.stringify(t8));

  log('9. errori:', errors.length ? errors : 'nessuno');
  await browser.close();
})();
