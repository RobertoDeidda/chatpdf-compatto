# Math assets / Risorse matematiche

[English](#english) · [Italiano](#italiano)

## English

`katex-assets.js` bundles the KaTeX **0.16.25** stylesheet and **20 WOFF2 fonts** as `data:` URLs. It does not include the KaTeX JavaScript renderer or depend on a remote conversion service.

- Source: [KaTeX 0.16.25 npm archive](https://registry.npmjs.org/katex/-/katex-0.16.25.tgz).
- Verification: the original archive's SHA-512 was compared against `dist.integrity` in that version's npm metadata.
- Generator: `scripts/bundle-katex.cjs` in the repository; run `npm run bundle:math` after installing development dependencies.
- License: [original MIT notice](LICENSE-katex.txt). The legal notice is preserved in its original English text.

## Italiano

`katex-assets.js` include il foglio di stile di KaTeX **0.16.25** e **20 font WOFF2** come URL `data:`. Non include il renderer JavaScript di KaTeX e non dipende da un servizio remoto di conversione.

- Origine: [archivio npm di KaTeX 0.16.25](https://registry.npmjs.org/katex/-/katex-0.16.25.tgz).
- Verifica: lo SHA-512 dell'archivio originale è stato confrontato con `dist.integrity` nei metadati npm della stessa versione.
- Generatore: `scripts/bundle-katex.cjs` nel repository; esegui `npm run bundle:math` dopo aver installato le dipendenze di sviluppo.
- Licenza: [avviso MIT originale](LICENSE-katex.txt). Il testo legale viene conservato nella sua lingua originale, l'inglese.
