const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type()==='error' && !/ERR_|fonts.g/.test(m.text())) errors.push(m.text()); });
  await p.route('**/rest/v1/**', r => r.fulfill({status:200, contentType:'application/json', body:'[]'}));
  await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore','Collaudo'); } catch(e){} });
  await p.goto(PAGINA);
  await p.waitForTimeout(1200);

  // L'anteprima deve coincidere con il pezzo che scende davvero, per 60 pezzi
  const t = await p.evaluate(async () => {
    const B = window.__baseline;
    B.start('daily');
    const errori = [];
    const visti = {};
    const etichette = {};
    for (let i = 0; i < 140; i++){
      // il campo si svuota di continuo: serve una partita lunga, non un record
      const g = B.state().grid;
      for (let y = 0; y < 17; y++) for (let x = 0; x < 12; x++) g[y][x] = null;
      const prev = B.anteprima();
      const etichetta = document.getElementById('msT0').textContent;
      const prima = B.state().cur;
      B.hardDrop();
      // il pezzo nuovo entra solo quando la riga ha finito di stamparsi:
      // aspettare un tempo fisso vuol dire leggere ancora quello vecchio
      let giri = 0;
      while (B.state().phase === 'play' && B.state().cur === prima && giri++ < 40)
        await new Promise(r => setTimeout(r, 25));
      if (B.state().phase !== 'play') break;
      const arrivato = B.state().cur.key;
      visti[arrivato] = (visti[arrivato] || 0) + 1;
      etichette[arrivato] = etichetta;
      if (prev[0] !== arrivato) errori.push(i + ': previsto ' + prev[0] + ', arrivato ' + arrivato);
    }
    return { errori: errori.slice(0, 6), quanti: errori.length, visti: visti, etichette: etichette };
  });
  console.log('confronto:', JSON.stringify(t));
  console.log('errori js:', errors.length ? errors : 'nessuno');
  await b.close();
})();
