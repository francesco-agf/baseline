# AGF Arcade — Baseline — il puzzle tipografico

Contesto per Claude Code. Il **brief operativo** in corso e il piano di lavoro stanno in
`PASSAGGIO.md` nel repo della sala (`francesco-agf/francesco-agf.github.io`): leggilo prima di
toccare qualunque cosa.

## Cos'e' questo repo

Tetris tipografico: i pezzi non sono tetramini astratti, sono le **parti anatomiche
della lettera** (asta, occhiello, traversa, ascendente, discendente, grazia, terminale) e ognuno
e' una lastra della quadricromia. Riga piena = riga mandata in stampa. Quattro righe insieme
sono una **quadricromia**, e il colore che ne esce entra nella **mazzetta**, che resta fra una
partita e l'altra. Dal sesto corpo arriva il **fuori registro**: finche' sei fuori registro le
righe non pagano, e si rimette a registro solo chiudendo una quadricromia.

Fa parte di una **sala di cinque repository** — quattro giochi piu' la pagina d'ingresso — che
si comportano come un prodotto solo:

| Repo | Indirizzo pubblico |
|---|---|
| `francesco-agf/francesco-agf.github.io` | https://francesco-agf.github.io/ |
| `francesco-agf/baseline` | https://francesco-agf.github.io/baseline/ |
| `francesco-agf/refusi` | https://francesco-agf.github.io/refusi/ |
| `francesco-agf/leporello` | https://francesco-agf.github.io/leporello/ |
| `francesco-agf/tiratura` | https://francesco-agf.github.io/tiratura/ |

Repo separati per una ragione precisa: GitHub Pages accetta **un solo dominio personalizzato
per repository**. Gli indirizzi sono gia' stati condivisi e **non cambiano**.

## Le due forme dello stesso codice — la regola che rompe tutto se ignorata

    sorgente/baseline.html   il sorgente di lavoro. Non ha doctype ne' <head>.
    index.html        la versione pubblicata, con la testata completa.
                      E' GENERATA: non si modifica a mano.

Si modifica **sempre** `sorgente/baseline.html` e poi si rigenera:

    python3 sorgente/build.py

`build.py` incolla `sorgente/testa.html` davanti al corpo del sorgente. Va rilanciato **dopo
ogni modifica**: i collaudi girano su `index.html`, e le media query del telefono funzionano
solo li', perche' il sorgente non ha il meta viewport.

Se modifichi `index.html` a mano, la modifica sparisce alla prossima build. Se modifichi il
sorgente e non ricostruisci, pubblichi la versione vecchia.

## Come si collauda

Servono `playwright` e Chromium. Dalla cartella `sorgente/`:

    node prova-regressione.js        il giro completo
    node prova-regole.js             la finestra delle regole
    node prova-abbandono.js          la resa dalla pausa
    node prova-anteprima.js          l'anteprima dice il vero sui prossimi pezzi
    node prova-segni-e-barra.js      i segni speciali e la barra colore
    node prova-di-stampa.js          la prova di stampa JPEG e GIF
    node prova-di-stampa-limiti.js   i casi limite del foglio
    node prova-classifica.js         l'invio del punteggio
    node prova-selezione.js          niente selezione del testo sul campo

Le prove aprono `index.html` da `file://` e pilotano il gioco dalle API di collaudo
(`window.__baseline`). Non aspettano tempi fissi: chiamano l'avanzamento a mano, perche'
`requestAnimationFrame` si ferma quando la scheda va in secondo piano.

## Pubblicazione

GitHub Pages, **branch `main`, cartella radice**, workflow automatico
`pages build and deployment`. Nessuna Action personalizzata, nessuna cartella `/docs`,
nessun `gh-pages`.

**Un branch di lavoro non e' pubblicato finche' non entra in `main`.** Il ciclo e':
branch -> collaudo -> merge in `main` -> attesa del workflow -> verifica dell'URL pubblico.

## Cose da non rompere

- **La famiglia.** I quattro giochi devono sembrare fatti dalla stessa mano. C'e' una prova
  che lo pretende: `sala/sorgente/prova-famiglia-stili.js` confronta gli stili calcolati dei
  quattro giochi e fallisce se divergono. Se cambi un pulsante qui, cambialo in tutti e quattro.
- **Il nome del giocatore** sta in `localStorage` sotto la chiave condivisa `agf.giocatore`,
  uguale per tutta la sala. La vecchia `baseline.nome` resta letta come ripiego.
- **La classifica** e' la tabella `public.scores` di Supabase, condivisa fra i quattro giochi,
  con la chiave pubblicabile nel client e RLS in sola lettura e inserimento. Non toccare lo
  schema remoto.
- **Gli indirizzi nel codice sono assoluti**, non relativi: i collegamenti fra i giochi
  funzionano anche fuori dal loro sottopercorso.
- **Niente `localhost`, IP privati, `file://` o percorsi del computer** in quello che va
  pubblicato.

## Attenzione, qui

- Le chiavi dei pezzi sono `O T L I J S Z` (occhiello, traversa, ascendente, asta,
  discendente, grazia, terminale), **non** `C M Y K`: la lastra e' un attributo del pezzo.
- Il campo e' 12 x 17 (la proporzione dell'A4), non 10 x 20.
- L'anteprima dei prossimi pezzi non legge il sacchetto: rifa' le stesse estrazioni con
  `chiaviFuture(n)`. Se cambi l'ordine delle estrazioni, cambia anche quella.
- Baseline e' il primo nato: e' stato riallineato alla famiglia il 30.08.2026, e la prova
  degli stili lo verifica.

## Il tono

Il progetto e' un pezzo di marketing di una tipografia milanese del 1950. Tutto — interfaccia,
regole, commenti nel codice, messaggi di commit — e' in **italiano**, e usa il vocabolario del
mestiere: forma, registro, segnatura, passata, bozza, sigillo, mazzetta. I commenti nel codice
spiegano **perche'** una cosa e' fatta cosi', non cosa fa la riga sotto. Mantieni questo tono.
