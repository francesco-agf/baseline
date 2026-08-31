# Baseline

Il **puzzle tipografico** di Arti Grafiche Fimognari, dal 1950. I pezzi non sono tetramini
astratti ma parti anatomiche della lettera — aste, occhielli, traverse, grazie — da incastrare
sulla linea di base. Riga piena = riga mandata in stampa.

Gioca: https://francesco-agf.github.io/baseline/
La sala giochi: https://francesco-agf.github.io/

## Come funziona

- **Il foglio** — 12 colonne × 17 righe, la proporzione di un A4. Su telefono arriva al 95%
  della larghezza dello schermo.
- **Composizione del giorno** — ogni giorno la stessa sequenza di pezzi per tutti, così i
  punteggi sono confrontabili. In alternativa, partita libera, che non entra in classifica.
- **Righe guida** — ascendente, altezza maiuscola, altezza x, linea di base. Chiudere una riga
  su una guida vale un bonus di allineamento.
- **Quadricromia** — quattro righe in un colpo solo: lampeggiano le quattro lastre, i crocini
  di registro rientrano, scende il timbro del capo reparto. Dalle percentuali di inchiostro
  delle righe chiuse nasce un **campione**, mattoncino 1×1 di un colore che non esiste fra i
  sette pezzi.
- **I segni speciali** — mattoncini di piombo bianco con un segno inciso: ¶ capoverso (manda in
  stampa la riga dove si posa), ✂ taglierina (rifila la riga più alta), & legatura (lega le
  caselle vuote a fianco), ✱ chiamata di nota (la prossima riga vale il doppio).
- **La barra colore** — la scala di controllo che corre sul bordo del foglio: quattro celle con
  un'iride che scorre. È sempre orizzontale e **non si gira**.
- **Gli attrezzi** — crocino, conta-fili, rulla d'inchiostro: cinque celle che non si incastrano
  pulito.
- **Comic Sans maledetto** — consuma punti finché resta in campo. Stamparlo lo esorcizza.
- **La scala dei caratteri** — salendo di corpo i glifi cambiano classe: grottesco, egiziano,
  transizionale, bodoniano, bodoniano nero, condensato.
- **Musica e rumore di macchina** — Torchio, Rotativa, Camera oscura, più Heidelberg che gira
  e Mettifoglio.
- **La prova di stampa** — a fine partita la composizione si scarica come JPEG o come GIF
  animata in cui il foglio si stampa una riga per volta.

## Comandi

Frecce per spostare, ↑ o X per ruotare, ↓ discesa dolce, spazio battuta secca, C per tenere un
pezzo, P pausa. Da telefono: i tasti sotto al campo, oppure scorri sul campo per spostare,
tocca per ruotare, scorri in basso per la battuta secca; la pausa è il pulsante nella striscia
sopra al foglio, e in pausa c'è **Abbandona la partita**.

## La classifica

È quella condivisa della sala giochi: un progetto Supabase dedicato che contiene solo punteggi,
con una colonna `gioco` che dice da quale arriva la riga. La chiave nel sorgente è pubblicabile
per definizione e non dà accesso a nient'altro; le regole del database permettono di leggere e
aggiungere una riga, mai di modificarla o cancellarla. Il nome del giocatore vale per tutti i
giochi della sala.

## Il sorgente

`index.html` alla radice è **generato**: non modificarlo a mano. Si lavora su
`sorgente/baseline.html` e si rilancia `python3 sorgente/build.py` dopo ogni modifica.
In `sorgente/` ci sono anche nove collaudi automatici — meccaniche, regole, anteprima,
prova di stampa, classifica. Le istruzioni sono in [`sorgente/LEGGIMI.md`](sorgente/LEGGIMI.md).

`SHARE_URL`, in cima allo script, è l'indirizzo che compare in fondo a ogni risultato condiviso.
