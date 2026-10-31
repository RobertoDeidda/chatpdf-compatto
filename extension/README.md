# ChatPDF Compatto v0.9

Esporta una singola risposta o una selezione di ChatGPT in PDF A4 verticale. Il pulsante «Esporta tutta la chat» è stato rimosso. Formule e impaginazione usano lo stesso motore della versione precedente.

## Installazione e aggiornamento

1. Estrai ChatPDF-Compatto-v0.9.zip.
2. Apri chrome://extensions e attiva Modalità sviluppatore.
3. Disattiva la precedente copia e usa Carica estensione non pacchettizzata sulla cartella estratta contenente manifest.json.
4. Verifica la versione 0.9.0 e ricarica ChatGPT con Ctrl+R.

Se Chrome usa già la cartella di sviluppo aggiornata, basta ricaricare l'estensione e poi ChatGPT. Ricaricare una vecchia cartella estratta non ne aggiorna i file.

## Utilizzo

Premi Esporta PDF sotto una risposta, scegli le impostazioni e apri l'anteprima. Quando il documento è pronto, premi Stampa / Salva PDF. In Chrome scegli Salva come PDF, A4 verticale, scala 100% e margini Predefiniti. Puoi scegliere nome e cartella al momento del salvataggio.

Se il pulsante manca, seleziona il testo della risposta e usa il tasto destro → Esporta selezione in PDF. Viene esportato soltanto ciò che hai selezionato, mantenendo l'HTML disponibile: controlla che la selezione comprenda tutta la risposta desiderata. Non serve copiarla in un altro programma.

## Modifiche e limiti

La versione 0.9 riconosce anche risposte dentro contenitori condivisi con domande o altri messaggi. Include il menu della selezione, che non dipende dal riconoscimento automatico della risposta. La causa esatta dei messaggi mancanti nella conversazione dell'utente non è stata verificata sul loro DOM reale.

Verificati 21 scenari locali dei pulsanti, il collegamento del menu e l'esportazione con formule, paragrafi e tabelle. Questi test non sostituiscono la prova sulla conversazione reale.

Il permesso contextMenus serve per la voce del tasto destro, limitata ai siti ChatGPT. Non sono stati aggiunti servizi esterni. Preferenze, preparazione e conversione restano locali. Il browser può ricaricare le immagini dagli indirizzi originali.

I paragrafi brevi e le righe di tabella sono tenuti insieme; i blocchi molto lunghi possono continuare sulla pagina successiva. La prima anteprima è continua: i salti di pagina effettivi sono visibili nell'anteprima di stampa. Eventuali numeri di pagina dipendono dall'opzione Intestazioni e piè di pagina di Chrome.

KaTeX 0.16.25: CSS e font locali, licenza in vendor/LICENSE-katex.txt. MathJax, grafici protetti o componenti interattivi possono avere limiti di esportazione. Se una risposta continua a non avere il pulsante, usa la selezione e segnala la versione installata e un esempio del messaggio.
