# Verifiche di esportazione

Questi strumenti sono destinati allo sviluppo e non servono per installare l'estensione.

Prerequisiti: Node.js, dipendenze di sviluppo (`npm install` nella cartella superiore), Chrome e Python con `pypdf`. Su Windows viene cercato Chrome in `C:/Program Files/Google/Chrome/Application/chrome.exe`; per un'altra posizione impostare `CHROME_PATH`. Per un altro interprete Python impostare `PYTHON_PATH`.

Eseguire `npm test` dalla cartella superiore. Prima vengono eseguite le prove dinamiche dei pulsanti, poi il test completo di esportazione. Per eseguirli separatamente: `npm run test:buttons` e `npm run test:export`.

`buttons.cjs` verifica 21 scenari, inclusi aggiornamenti del testo, rimozione dei pulsanti, contenitori condivisi tra domanda e risposta, selezione dal menu contestuale e assenza dell'esportazione dell'intera chat. Verifica anche che non venga esportata una risposta diversa quando quella scelta sparisce. Questi test usano una simulazione del motore PDF per controllare il contenuto passato. `context-menu.cjs` verifica la registrazione del menu e l'inoltro del comando alla scheda corretta.

`export.cjs` genera una pagina locale di prova, carica gli script dell'estensione con una simulazione minima di `chrome.storage`, usa i pulsanti effettivi di esportazione e crea due PDF in `tmp/pdfs`.

Controlli: contenuto della sola risposta e della selezione, nessuna stampa automatica, formule KaTeX con font locali, MathML e SVG MathJax, matrici larghe, paragrafi brevi, intestazioni con contenuto successivo, righe di tabella integre, intestazioni ripetute, codice breve e lungo, paragrafi molto lunghi, formato A4, font 10/12 pt, margini 15/20 mm, anteprima in una finestra stretta, immagini che non terminano il caricamento, assenza di errori JavaScript.

Il test legge anche il testo dei PDF e verifica su quale pagina si trovano inizio e fine di ciascuno dei 24 paragrafi brevi e delle 65 righe di tabella. Questo controlla la frammentazione realmente prodotta da Chrome, oltre alle regole CSS.

Per la verifica visiva usare `pdftoppm -png tmp/pdfs/regression-default.pdf tmp/pdfs/default` e ripetere per `regression-large.pdf`. I PDF sono documenti di regressione, non appunti da consegnare.

Il test è stato eseguito con Chrome headless 156 e una pagina locale: non simula il login, le policy CSP o tutte le varianti del DOM di ChatGPT, né automatizza il dialogo di stampa del sistema. Completare quindi la prova manuale descritta nel README dell'estensione.

Per ricostruire le risorse matematiche: `npm run bundle:math`. Lo script incorpora CSS e font WOFF2 del pacchetto KaTeX 0.16.25 in un unico script locale; non include né esegue il renderer JavaScript di KaTeX nell'estensione.
