# ChatPDF Compatto

Estensione Chrome per esportare una risposta di ChatGPT in PDF A4 verticale, con testo selezionabile, formule matematiche e impaginazione compatta. Versione **0.9.0**.

## Funzioni

- Pulsante **Esporta PDF** sotto le risposte riconosciute.
- **Esporta selezione in PDF** nel menu del tasto destro: permette di esportare anche contenuti senza pulsante.
- Font da 9 a 12 pt, margini e spaziatura personalizzabili, preferenze locali.
- Formule KaTeX con CSS e font inclusi, SVG/MathML MathJax quando disponibili.
- Paragrafi brevi e righe di tabella mantenuti insieme; blocchi lunghi divisibili tra pagine.
- Anteprima e salvataggio attraverso Chrome, senza servizi di conversione esterni.

## Installazione

1. Scarica il repository ed estrailo, oppure clonalo.
2. Apri `chrome://extensions` e attiva **Modalità sviluppatore**.
3. Premi **Carica estensione non pacchettizzata** e seleziona la cartella `extension`.
4. Disattiva eventuali copie precedenti e ricarica la scheda ChatGPT.

Per usare l'estensione non servono Node.js o Python. Non è pubblicata sul Chrome Web Store.

## Utilizzo

Premi **Esporta PDF**, scegli le impostazioni e apri l'anteprima. Quando il documento è pronto, premi **Stampa / Salva PDF**. In Chrome scegli **Salva come PDF**, A4 verticale, scala 100% e margini predefiniti.

Se il pulsante manca: seleziona il contenuto desiderato, fai clic destro e scegli **Esporta selezione in PDF**. Controlla che la selezione comprenda tutta la risposta. Il testo resta selezionabile nel PDF; non viene usato uno screenshot come metodo principale.

La prima anteprima è continua: i confini effettivi delle pagine sono visibili nell'anteprima di stampa di Chrome. Nome e destinazione del file si scelgono al salvataggio.

## Privacy e limiti

Il contenuto non viene inviato a servizi di conversione. Il browser può recuperare le immagini dai loro URL originali. CSS e font KaTeX sono inclusi localmente.

Permessi: `storage` per le preferenze e `contextMenus` per l'esportazione della selezione. Gli script operano su `chatgpt.com` e `chat.openai.com`.

Il DOM di ChatGPT può cambiare: il pulsante potrebbe non comparire su alcuni messaggi. L'esportazione della selezione è disponibile come alternativa. Grafici protetti, contenuti interattivi, immagini non caricate e formule particolari possono avere limitazioni. Le verifiche automatiche usano pagine locali e non garantiscono tutte le varianti della pagina ChatGPT.

## Sviluppo e test

Prerequisiti: Node.js moderno, Python con `pypdf` e Chrome o Chromium.

```sh
npm install
python -m pip install pypdf
npm test
npm run package
```

Su Windows i test cercano Chrome nel percorso standard. Imposta `CHROME_PATH` per un percorso diverso e `PYTHON_PATH` per scegliere l'interprete Python. Su altri sistemi puoi installare il browser di test con `npx playwright install chromium`.

Lo ZIP installabile viene creato in `output/`. Le prove PDF sono in `tmp/pdfs/`; queste cartelle sono escluse da Git.

Sono inclusi test del menu contestuale, 21 scenari dei pulsanti e verifiche sui PDF per formule, 24 paragrafi e 65 righe di tabella. Per i dettagli consulta [tests/README.md](tests/README.md).

## Struttura

- `extension/`: estensione installabile senza compilazione.
- `scripts/`: preparazione delle risorse matematiche e creazione dello ZIP.
- `tests/`: test dinamici e di esportazione.
- [CHANGELOG.md](CHANGELOG.md): cronologia delle modifiche.

## Licenze

Non è ancora stata assegnata una licenza di distribuzione al codice originale del progetto. Le risorse KaTeX mantengono la loro licenza MIT, inclusa in [extension/vendor/LICENSE-katex.txt](extension/vendor/LICENSE-katex.txt).

Progetto indipendente, non affiliato a OpenAI.
