# Baseline — il puzzle tipografico

Repo `francesco-agf/baseline` → https://francesco-agf.github.io/baseline/
Primo gioco della sala giochi AGF. La famiglia è di cinque repo: `francesco-agf.github.io`
(la sala), `baseline`, `refusi`, `leporello`, `tiratura`.

## Prima di toccare qualcosa

Il quaderno di progetto sta su Google Drive, in **Sala Giochi AGF / Quaderno**.
Va letto prima di cominciare — qui ci sono solo dieci righe di promemoria.

| File | Cosa contiene |
|---|---|
| `AGF-come-si-lavora.md` | come si monta, come si prova, come si pubblica |
| `AGF-decisioni.md` | che cosa è stato deciso, e perché |
| `AGF-marchio.md` | bianco su scuro, nero su bianco |
| `AGF-baseline.md` | **questo gioco**: inchiostri, campione, fuori registro, mazzetta |
| `AGF-sala.md` | classifiche, database, ponte fra i giochi, privacy |

## Le quattro cose da non sbagliare

1. **`index.html` è generato.** Si modifica `sorgente/baseline.html`, poi
   `python3 sorgente/build.py`. Le prove girano su `index.html`: senza il montaggio si
   prova la versione vecchia. È la trappola numero uno.
2. **Non si scrive «Tetris».** Il gioco è *«il puzzle tipografico»*, ovunque — titolo,
   metadati, Open Graph, README, e anche dentro `anteprima.jpg`.
3. **Si scrive in italiano.** Funzioni, variabili, commenti, messaggi.
4. **Supabase non si tocca** e **Aruba è in stand-by**.

## Le prove

Playwright, in `sorgente/`, più quelle comuni in `../sala/sorgente/`: i cinque repo vanno
clonati come cartelle sorelle e quello della sala **deve** chiamarsi `sala`.
`node prova-<nome>.js` dalla cartella `sorgente/`. Prima di pubblicare girano tutte.

Attenzione: le prove devono mettere `agf.giocatore` in `localStorage` con `addInitScript`
prima di caricare la pagina, e dopo `hardDrop()` si aspetta che `cur` cambi identità, non
un tempo fisso.

## Pubblicare

Branch di lavoro → prove → pull request → merge in `main` → GitHub Pages pubblica da sola
dalla radice → si verifica l'URL dal vivo. Dettagli in `AGF-come-si-lavora.md`.
