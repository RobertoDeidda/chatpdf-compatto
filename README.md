<div align="center">

# ChatPDF Compatto

**From ChatGPT answers to compact, readable PDFs.**<br>
**Dalle risposte di ChatGPT a PDF compatti e leggibili.**

Chrome extension · A4 PDF · Selectable text · Math & images<br>
Estensione Chrome · PDF A4 · Testo selezionabile · Formule e immagini

**v0.9.0 · Manual installation / Installazione manuale**

[English](#english) · [Italiano](#italiano) · [Changelog](CHANGELOG.md) · [Report a problem / Segnala un problema](https://github.com/RobertoDeidda/chatpdf-compatto/issues)

</div>

---

## English

Save a ChatGPT answer as an A4 PDF for studying, printing or keeping your notes. Export a single answer or just the part you select, with selectable text and support for rendered formulas, available images, tables and code.

**How it works:** the extension copies the rendered content into a print preview and uses Chrome to create the PDF. No external conversion service is involved. Buttons are currently in Italian; their English meanings appear below.

### Features

| Feature | What you get |
| --- | --- |
| One-answer export | **Esporta PDF** below recognized answers. |
| Selection export | Select content → right-click → **Esporta selezione in PDF**, even when the automatic button is missing. |
| Selectable text | Search and copy text in the PDF; export uses HTML rather than a full-page screenshot. |
| Math support | Bundled KaTeX styles and fonts, plus support for available MathJax SVG/MathML. |
| Compact layout | 9–12 pt text, adjustable margins and spacing, locally saved preferences. |
| Page-break handling | Short paragraphs and table rows stay together where possible; long blocks can continue on another page. |

### Install in Chrome

1. Choose **Code → Download ZIP** on this repository and extract it, or clone the repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and choose the **`extension`** folder containing `manifest.json`.
4. Disable older copies of ChatPDF Compatto and reload your ChatGPT tab.

No Node.js, Python or build step is needed to use the extension. It is not currently published on the Chrome Web Store.

### Save your first PDF

1. On a completed ChatGPT answer, click **Esporta PDF** (*Export PDF*).
2. Choose your layout settings and open the preview.
3. When ready, click **Stampa / Salva PDF** (*Print / Save PDF*).
4. In Chrome choose **Save as PDF**, **A4**, **Portrait**, **100%** scale and **Default** margins. Choose a filename and save.

**Missing button?** Select the answer, right-click and choose **Esporta selezione in PDF** (*Export selection to PDF*). Only selected content is exported: include the entire answer if you want all of it.

The first preview is continuous; actual page boundaries appear in Chrome's print preview. See the [user guide](extension/README.md#english) for updates and troubleshooting.

### Privacy and limitations

- Conversion and preferences stay local. Images may still load from their original online URLs. KaTeX styles and fonts are bundled.
- Permissions: `storage` saves preferences; `contextMenus` adds selection export. Content scripts run on `chatgpt.com` and `chat.openai.com`.
- ChatGPT's page structure can change, so automatic buttons may be missing. Selection export provides a fallback.
- Unloaded images, protected charts, interactive content and unusual formulas may not export correctly. Check the print preview before saving.
- Tests use local fixtures, not every live ChatGPT page. Whole-chat export is not included.

### Development

Install Node.js, Python and Chrome or Chromium, then run from the repository root:

```sh
npm install
python -m pip install pypdf
npm test
npm run package
```

Tests look for Chrome in its standard Windows location. Set `CHROME_PATH` or `PYTHON_PATH` for custom paths. To use Playwright's bundled Chromium, run `npx playwright install chromium`.

The installable ZIP goes in `output/`; test PDFs go in `tmp/pdfs/`. Both are excluded from Git. Checks cover the context menu, 21 button scenarios, formulas, 24 short paragraphs and 65 table rows. Read the [test guide](tests/README.md#english) for details.

### Support and share

If this tool helps you, **star the repository** or share its link with someone who studies or works with ChatGPT. [Report a problem](https://github.com/RobertoDeidda/chatpdf-compatto/issues) with your Chrome version, extension version, steps to reproduce and expected result. Include a short, non-sensitive example and remove personal information from screenshots.

### Files and licensing

- [`extension/`](extension/): ready-to-load extension.
- [`scripts/`](scripts/): math asset bundling and ZIP packaging.
- [`tests/`](tests/): button, context-menu and PDF checks.
- [Changelog](CHANGELOG.md): version history in both languages.

The original project code does not yet have a distribution license. Do not assume open-source reuse rights. KaTeX resources retain their [MIT license](extension/vendor/LICENSE-katex.txt); see [asset details](extension/vendor/README.md#english).

Independent project, not affiliated with or endorsed by OpenAI.

---

## Italiano

Salva una risposta di ChatGPT in un PDF A4 da studiare, stampare o conservare nei tuoi appunti. Esporta una singola risposta o solo la parte selezionata, con testo selezionabile e supporto per formule già visualizzate, immagini disponibili, tabelle e codice.

**Come funziona:** l'estensione copia il contenuto già visualizzato in un'anteprima e usa Chrome per creare il PDF. Non utilizza servizi esterni di conversione. I pulsanti sono attualmente in italiano.

### Funzioni

| Funzione | Cosa ottieni |
| --- | --- |
| Esportazione di una risposta | **Esporta PDF** sotto le risposte riconosciute. |
| Esportazione della selezione | Seleziona il contenuto → clic destro → **Esporta selezione in PDF**, anche quando manca il pulsante automatico. |
| Testo selezionabile | Cerca e copia il testo nel PDF: l'esportazione usa l'HTML anziché uno screenshot dell'intera pagina. |
| Supporto matematico | Stili e font KaTeX inclusi, più supporto per SVG/MathML MathJax disponibili. |
| Impaginazione compatta | Testo da 9 a 12 pt, margini e spaziatura regolabili, preferenze salvate localmente. |
| Gestione dei salti di pagina | Paragrafi brevi e righe di tabella restano insieme quando possibile; i blocchi lunghi possono continuare nella pagina successiva. |

### Installazione in Chrome

1. Scegli **Code → Download ZIP** nel repository ed estrai l'archivio, oppure clona il repository.
2. Apri `chrome://extensions` e attiva **Modalità sviluppatore**.
3. Premi **Carica estensione non pacchettizzata** e scegli la cartella **`extension`** contenente `manifest.json`.
4. Disattiva le copie precedenti di ChatPDF Compatto e ricarica la scheda ChatGPT.

Per usare l'estensione non servono Node.js, Python o una compilazione. Al momento non è pubblicata sul Chrome Web Store.

### Salva il tuo primo PDF

1. Su una risposta completata di ChatGPT, premi **Esporta PDF**.
2. Scegli le impostazioni di impaginazione e apri l'anteprima.
3. Quando è pronta, premi **Stampa / Salva PDF**.
4. In Chrome scegli **Salva come PDF**, **A4**, orientamento **Verticale**, scala **100%** e margini **Predefiniti**. Scegli il nome del file e salva.

**Manca il pulsante?** Seleziona la risposta, fai clic destro e scegli **Esporta selezione in PDF**. Viene esportato solo il contenuto selezionato: includi tutta la risposta se vuoi salvarla per intero.

La prima anteprima è continua; i confini effettivi delle pagine compaiono nell'anteprima di stampa di Chrome. Consulta la [guida all'uso](extension/README.md#italiano) per aggiornamenti e problemi comuni.

### Privacy e limiti

- Conversione e preferenze restano locali. Le immagini possono comunque essere caricate dai loro indirizzi online originali. Stili e font KaTeX sono inclusi.
- Permessi: `storage` salva le preferenze; `contextMenus` aggiunge l'esportazione della selezione. Gli script operano su `chatgpt.com` e `chat.openai.com`.
- La struttura della pagina ChatGPT può cambiare: i pulsanti automatici potrebbero mancare. L'esportazione della selezione offre un'alternativa.
- Immagini non caricate, grafici protetti, contenuti interattivi e formule particolari potrebbero non essere esportati correttamente. Controlla l'anteprima prima di salvare.
- I test usano pagine locali e non coprono tutte le pagine reali di ChatGPT. L'esportazione dell'intera chat non è inclusa.

### Sviluppo

Installa Node.js, Python e Chrome o Chromium, poi esegui dalla cartella principale del repository:

```sh
npm install
python -m pip install pypdf
npm test
npm run package
```

I test cercano Chrome nel percorso Windows standard. Imposta `CHROME_PATH` o `PYTHON_PATH` per percorsi diversi. Per usare Chromium fornito da Playwright, esegui `npx playwright install chromium`.

Lo ZIP installabile viene creato in `output/`; i PDF di prova in `tmp/pdfs/`. Entrambe le cartelle sono escluse da Git. Le verifiche coprono menu contestuale, 21 scenari dei pulsanti, formule, 24 paragrafi brevi e 65 righe di tabella. Leggi la [guida ai test](tests/README.md#italiano) per i dettagli.

### Supporto e condivisione

Se ti è utile, **lascia una stella al repository** o condividi il link con chi studia o lavora con ChatGPT. [Segnala un problema](https://github.com/RobertoDeidda/chatpdf-compatto/issues) indicando versione di Chrome, versione dell'estensione, passaggi per riprodurlo e risultato atteso. Inserisci un esempio breve e non riservato ed elimina i dati personali dagli screenshot.

### File e licenze

- [`extension/`](extension/): estensione pronta da caricare.
- [`scripts/`](scripts/): preparazione delle risorse matematiche e creazione dello ZIP.
- [`tests/`](tests/): verifiche su pulsanti, menu contestuale e PDF.
- [Changelog](CHANGELOG.md): cronologia delle versioni in entrambe le lingue.

Il codice originale del progetto non ha ancora una licenza di distribuzione. Non presumere quindi che sia riutilizzabile come software open source. Le risorse KaTeX conservano la [licenza MIT](extension/vendor/LICENSE-katex.txt); consulta i [dettagli sulle risorse](extension/vendor/README.md#italiano).

Progetto indipendente, non affiliato né approvato da OpenAI.
