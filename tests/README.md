# Test guide / Guida ai test

[English](#english) · [Italiano](#italiano) · [Project / Progetto](../README.md)

## English

These tools are for development; they are not needed to install or use the extension.

### Setup and commands

From the repository root, install dependencies with `npm install` and `python -m pip install pypdf`. You need Node.js, Python and Chrome/Chromium.

On Windows, Chrome is sought at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Set `CHROME_PATH` for another location and `PYTHON_PATH` for another Python interpreter. For Playwright's browser, run `npx playwright install chromium`.

- `npm test`: context-menu checks, button checks, then PDF export checks.
- `npm run test:buttons`: button scenarios only.
- `npm run test:export`: PDF export checks only.
- `npm run bundle:math`: rebuild bundled KaTeX assets.
- `npm run package`: create and verify the installable ZIP in `output/`.

### What is checked

| File | Coverage |
| --- | --- |
| `context-menu.cjs` | Menu registration and command routing to the correct tab. |
| `buttons.cjs` | 21 scenarios: text changes, removed buttons, shared question/answer containers, selection export, no whole-chat export and no export of the wrong answer when the chosen one disappears. Uses a mock PDF engine. |
| `export.cjs` | Generates a local fixture, loads the real extension scripts with minimal mocked Chrome APIs, exercises export and generates two PDFs in `tmp/pdfs/`. |

PDF checks include answer/selection content, no automatic printing, local KaTeX fonts, MathML and MathJax SVG, wide matrices, headings with following content, repeated table headers, short and long code, long paragraphs, A4 size, 10/12 pt text, 15/20 mm margins, a narrow preview window, image loading timeouts and JavaScript errors.

Extracted PDF text is used to check the start and end page of **24 short paragraphs and 65 table rows**, testing actual page fragmentation rather than CSS alone.

### Manual checks and limits

For visual inspection, with Poppler installed, run `pdftoppm -png tmp/pdfs/regression-default.pdf tmp/pdfs/default` and repeat for `regression-large.pdf`. These are test documents, not user notes.

The suite previously passed with headless Chrome 156 and local fixtures. It does not simulate login, ChatGPT's CSP, every live page structure or the operating system print dialog. Also follow the [user guide](../extension/README.md#english) on a real ChatGPT conversation.

The math bundler embeds CSS and WOFF2 fonts from KaTeX 0.16.25. It does not include or execute the KaTeX JavaScript renderer in the extension.

## Italiano

Questi strumenti servono allo sviluppo; non sono necessari per installare o usare l'estensione.

### Preparazione e comandi

Dalla cartella principale del repository, installa le dipendenze con `npm install` e `python -m pip install pypdf`. Servono Node.js, Python e Chrome/Chromium.

Su Windows Chrome viene cercato in `C:/Program Files/Google/Chrome/Application/chrome.exe`. Imposta `CHROME_PATH` per un'altra posizione e `PYTHON_PATH` per un altro interprete Python. Per il browser di Playwright, esegui `npx playwright install chromium`.

- `npm test`: verifiche del menu contestuale, dei pulsanti e infine dell'esportazione PDF.
- `npm run test:buttons`: solo scenari dei pulsanti.
- `npm run test:export`: solo verifiche di esportazione PDF.
- `npm run bundle:math`: ricostruisce le risorse KaTeX incluse.
- `npm run package`: crea e verifica lo ZIP installabile in `output/`.

### Cosa viene verificato

| File | Copertura |
| --- | --- |
| `context-menu.cjs` | Registrazione del menu e inoltro del comando alla scheda corretta. |
| `buttons.cjs` | 21 scenari: modifiche al testo, pulsanti rimossi, contenitori condivisi tra domande e risposte, esportazione della selezione, assenza dell'esportazione dell'intera chat e nessuna esportazione della risposta sbagliata se quella scelta scompare. Usa un motore PDF simulato. |
| `export.cjs` | Genera una pagina locale, carica gli script reali dell'estensione con API Chrome simulate al minimo, esegue l'esportazione e genera due PDF in `tmp/pdfs/`. |

I controlli PDF includono contenuto della risposta/selezione, assenza di stampa automatica, font KaTeX locali, MathML e SVG MathJax, matrici larghe, titoli con contenuto successivo, intestazioni di tabella ripetute, codice breve e lungo, paragrafi lunghi, formato A4, testo 10/12 pt, margini 15/20 mm, anteprima stretta, scadenza dell'attesa delle immagini ed errori JavaScript.

Il testo estratto dai PDF permette di controllare la pagina iniziale e finale di **24 paragrafi brevi e 65 righe di tabella**, verificando la frammentazione reale e non soltanto il CSS.

### Verifiche manuali e limiti

Per l'ispezione visiva, con Poppler installato, esegui `pdftoppm -png tmp/pdfs/regression-default.pdf tmp/pdfs/default` e ripeti per `regression-large.pdf`. Sono documenti di prova, non appunti dell'utente.

La suite è stata superata con Chrome headless 156 e pagine locali. Non simula l'accesso, la CSP di ChatGPT, tutte le strutture della pagina reale o il dialogo di stampa del sistema. Segui anche la [guida all'uso](../extension/README.md#italiano) su una conversazione reale.

Il generatore matematico incorpora CSS e font WOFF2 di KaTeX 0.16.25. Non include né esegue il renderer JavaScript di KaTeX nell'estensione.
