# ChatPDF Compatto 0.9.0 — User guide / Guida all'uso

[English](#english) · [Italiano](#italiano) · [GitHub](https://github.com/RobertoDeidda/chatpdf-compatto)

## English

Export one ChatGPT answer or a selection as a compact A4 PDF. Text stays selectable, with support for formulas and available images. Buttons are currently in Italian. Whole-chat export is not included.

### Install or update

1. Extract the downloaded ZIP.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Disable the old copy, click **Load unpacked**, and choose the folder containing this guide and `manifest.json`. In a repository download, it is the `extension` folder.
4. Check that Chrome shows **0.9.0**, then reload ChatGPT.

If Chrome already points to the folder whose files you updated, reload the extension and then ChatGPT. Reloading an old extracted folder does not update its files.

### Export

Click **Esporta PDF** (*Export PDF*), choose settings and open the preview. When ready, click **Stampa / Salva PDF** (*Print / Save PDF*). In Chrome select **Save as PDF**, **A4**, **Portrait**, **100%** scale and **Default** margins. Choose the filename and destination when saving.

Alternatively, select content and right-click → **Esporta selezione in PDF** (*Export selection to PDF*). Only the selected rendered HTML is copied: select the full answer if you need all of it.

### Common problems

| Problem | What to do |
| --- | --- |
| Missing answer button | Use selection export. ChatGPT's page structure can prevent automatic detection. |
| Missing selection command | Check that version 0.9.0 is enabled, reload ChatGPT and select content before right-clicking. |
| Paragraph continues on another page | Short blocks stay together where possible; very long blocks can split. Check Chrome's print preview. |
| No page boundaries in the first preview | Expected: that preview is continuous. Chrome's print preview shows page breaks. |
| Missing image or formula | Let it load in ChatGPT, select it completely and retry. Protected or interactive content and some formula formats have limitations. |
| Need page numbers | Use Chrome's **Headers and footers** print option if available. |

### Privacy and support

Conversion and preferences stay local; images may load from original URLs. `storage` saves settings; `contextMenus` adds the right-click command on ChatGPT sites. No external conversion service is used.

Tests cover 21 local button scenarios, context-menu routing and PDFs with formulas, paragraphs and tables. They do not reproduce every real ChatGPT page, login state or browser policy.

KaTeX 0.16.25 styles and fonts are bundled; its original license is in `vendor/LICENSE-katex.txt`. The original project code has no distribution license yet. Independent project, not affiliated with OpenAI.

For help, use the repository's **Issues** tab. Include Chrome and extension versions, reproduction steps and a short example without personal information.

## Italiano

Esporta una risposta di ChatGPT o una selezione in un PDF A4 compatto. Il testo resta selezionabile, con supporto per formule e immagini disponibili. I pulsanti sono attualmente in italiano. L'esportazione dell'intera chat non è inclusa.

### Installazione o aggiornamento

1. Estrai lo ZIP scaricato.
2. Apri `chrome://extensions` e attiva **Modalità sviluppatore**.
3. Disattiva la vecchia copia, premi **Carica estensione non pacchettizzata** e scegli la cartella contenente questa guida e `manifest.json`. Nel repository è la cartella `extension`.
4. Controlla che Chrome mostri **0.9.0**, poi ricarica ChatGPT.

Se Chrome usa già la cartella di cui hai aggiornato i file, ricarica l'estensione e poi ChatGPT. Ricaricare una vecchia cartella estratta non ne aggiorna i file.

### Esportazione

Premi **Esporta PDF**, scegli le impostazioni e apri l'anteprima. Quando è pronta, premi **Stampa / Salva PDF**. In Chrome seleziona **Salva come PDF**, **A4**, orientamento **Verticale**, scala **100%** e margini **Predefiniti**. Nome e destinazione si scelgono al salvataggio.

In alternativa, seleziona il contenuto e fai clic destro → **Esporta selezione in PDF**. Viene copiato solo l'HTML visualizzato che hai selezionato: includi tutta la risposta se ti serve per intero.

### Problemi comuni

| Problema | Cosa fare |
| --- | --- |
| Manca il pulsante sotto la risposta | Usa l'esportazione della selezione. La struttura della pagina ChatGPT può impedirne il riconoscimento automatico. |
| Manca la voce per esportare la selezione | Verifica che la versione 0.9.0 sia attiva, ricarica ChatGPT e seleziona il contenuto prima del clic destro. |
| Un paragrafo continua in un'altra pagina | I blocchi brevi restano insieme quando possibile; quelli molto lunghi possono essere divisi. Controlla l'anteprima di stampa di Chrome. |
| La prima anteprima non mostra i confini delle pagine | È previsto: l'anteprima è continua. Quella di stampa di Chrome mostra i salti di pagina. |
| Manca un'immagine o una formula | Attendi il caricamento in ChatGPT, seleziona il contenuto completo e riprova. Contenuti protetti o interattivi e alcuni formati matematici hanno dei limiti. |
| Servono i numeri di pagina | Usa l'opzione **Intestazioni e piè di pagina** di Chrome, se disponibile. |

### Privacy e supporto

Conversione e preferenze restano locali; le immagini possono essere caricate dagli indirizzi originali. `storage` salva le impostazioni; `contextMenus` aggiunge il comando del tasto destro sui siti ChatGPT. Non vengono usati servizi esterni di conversione.

I test coprono 21 scenari locali dei pulsanti, l'inoltro del comando del menu e PDF con formule, paragrafi e tabelle. Non riproducono tutte le pagine reali di ChatGPT, gli stati di accesso o le regole del browser.

Stili e font KaTeX 0.16.25 sono inclusi; la licenza originale è in `vendor/LICENSE-katex.txt`. Il codice originale del progetto non ha ancora una licenza di distribuzione. Progetto indipendente, non affiliato a OpenAI.

Per assistenza usa la scheda **Issues** del repository. Indica versioni di Chrome e dell'estensione, passaggi per riprodurre il problema e un esempio breve senza dati personali.
