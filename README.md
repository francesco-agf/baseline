# Baseline

Il tetris tipografico di **Arti Grafiche Fimognari**, dal 1950. I pezzi non sono tetramini
astratti ma parti anatomiche della lettera — aste, occhielli, traverse, grazie — da incastrare
sulla linea di base. Riga piena = riga mandata in stampa.

Gioca: https://francesco-agf.github.io/baseline/

## Come funziona

- **Composizione del giorno** — ogni giorno la stessa sequenza di pezzi per tutti, così i
  punteggi sono confrontabili. In alternativa, partita libera.
- **Classifica** — a fine partita metti il nome ed entri in classifica; con le frecce si
  sfogliano i giorni passati e si vede chi ha giocato.
- **Righe guida** — ascendente, altezza maiuscola, altezza x, linea di base. Chiudere una riga
  su una guida vale il doppio.
- **Quadricromia** — quattro righe in un colpo solo: lampeggiano le quattro lastre, i crocini
  di registro rientrano e scende il timbro del capo reparto.
- **Gradi** — da Garzone a Bodoni, passando per Proto e Punzonista.
- **Comic Sans maledetto** — ogni tanto arriva un pezzo cursed: consuma punti finché resta in
  campo. Stamparlo lo esorcizza.
- **La scala dei caratteri** — salendo di corpo i glifi cambiano classe: grottesco, egiziano,
  transizionale, bodoniano, bodoniano nero, condensato.
- **Musica** — tre giri originali sintetizzati sul momento: Torchio, Rotativa, Camera oscura.
  Il tempo accelera col corpo.

## Comandi

Frecce per spostare, ↑ o X per ruotare, ↓ discesa dolce, spazio battuta secca, C per tenere un
pezzo, P pausa. Da telefono: i tasti sotto al campo, oppure scorri sul campo per spostare,
tocca per ruotare, scorri in basso per la battuta secca.

## Tecnica

Un solo file, `index.html`. Nessuna dipendenza a parte i caratteri da Google Fonts. Il marchio
è SVG in linea, la musica e gli effetti sono sintetizzati con la Web Audio API.

La classifica sta su un progetto Supabase dedicato che contiene solo punteggi: la chiave nel
sorgente è pubblicabile per definizione e non dà accesso a nient'altro. Le regole del database
permettono di leggere e aggiungere una riga, mai di modificarla o cancellarla.

`SHARE_URL`, in cima allo script, è l'indirizzo che compare in fondo a ogni risultato condiviso.
