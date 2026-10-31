const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
let katex;
try { katex = require('katex'); } catch (_) { katex = require('../tmp/vendor/package/dist/katex.js'); }

const root = path.resolve(__dirname, '..');
const extension = path.join(root, 'extension');
const output = path.join(root, 'tmp/pdfs');
fs.mkdirSync(output, { recursive: true });
function readPDF(filename) {
  return JSON.parse(execFileSync(process.env.PYTHON_PATH || 'python', ['-c',
    'import json,sys; from pypdf import PdfReader; r=PdfReader(sys.argv[1]); print(json.dumps({"pages":[p.extract_text() for p in r.pages],"sizes":[[float(p.mediabox.width),float(p.mediabox.height)] for p in r.pages]}))',
    filename], { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }));
}
const formula = (tex, displayMode = true) => katex.renderToString(tex, { displayMode, throwOnError: true });
const text = 'La stima Monte Carlo utilizza campioni indipendenti dalla distribuzione di interesse. La variabilità dei risultati diminuisce aumentando il numero di simulazioni. ';
const paragraphs = Array.from({ length: 24 }, (_, i) => {
  const key = `P${String(i).padStart(2, '0')}`;
  return `<p>${key}_BEGIN ${text.repeat(2 + i % 3)} ${key}_END</p>`;
}).join('');
const rows = Array.from({ length: 65 }, (_, i) =>
  `<tr><td>R${i}_BEGIN</td><td>${text}</td><td>R${i}_END</td></tr>`).join('');
const expressions = [
  String.raw`\hat\mu_N=\frac{1}{N}\sum_{i=1}^{N}X_i,\qquad \operatorname{Var}(\hat\mu_N)=\frac{\sigma^2}{N}`,
  String.raw`\int_{-\infty}^{+\infty}\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)\,dx=1`,
  String.raw`\mathbf{\Sigma}=\begin{pmatrix}\sigma_1^2 & \rho\sigma_1\sigma_2\\\rho\sigma_1\sigma_2 & \sigma_2^2\end{pmatrix}`,
  String.raw`f(x)=\begin{cases}\frac{x^2}{2}&x\geq 0\\-\sqrt{-x}&x<0\end{cases}`,
  String.raw`\begin{aligned}\mathbb E[\bar X]&=\mu\\\operatorname{Var}(\bar X)&=\frac{\sigma^2}{n}\end{aligned}`,
  String.raw`\underbrace{X_1+\cdots+X_n}_{\text{campioni}}\xrightarrow[n\to\infty]{\mathcal D}\mathcal N(\mu,\sigma^2)`,
  String.raw`\sqrt{\frac{\sum_{i=1}^{n}(X_i-\bar X)^2}{n-1}}\quad\left\lVert\mathbf X\right\rVert_2`,
  String.raw`A=\begin{pmatrix}` + Array.from({ length: 2 }, (_, r) => Array.from({ length: 14 }, (_, c) => `a_{${r + 1},${c + 1}}`).join('&')).join(String.fromCharCode(92, 92)) + String.raw`\end{pmatrix}`
];

const fixture = `<!doctype html><html><head><title>Statistica Computazionale - ChatGPT</title>
  <style>body{background:#222;color:white;font:16px Arial}header{display:flex}.markdown{display:flex;flex-direction:column;width:650px}</style>
  </head><body><header><button>Condividi</button></header>
  <div data-message-author-role="user">USER_MESSAGE_ONLY</div>
  <div data-message-author-role="assistant" id="selected"><div class="markdown" style="display:flex;flex-direction:column;overflow:hidden;max-width:650px">
    <h1>Statistica Computazionale</h1>
    <p>Formule, impaginazione e codice R. La variabile ${formula(String.raw`X_i\sim\mathcal N(\mu,\sigma^2)`, false)} segue una distribuzione normale.</p>
    ${expressions.map((tex, i) => `<div class="math-example" data-example="${i}">${formula(tex)}</div>`).join('')}
    <p>MathML nativo: <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>a</mi><mi>b</mi></mfrac></math>.</p>
    <mjx-container display="true"><mjx-assistive-mml style="display:none"><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mi>x</mi><mo>+</mo><mn>1</mn></mrow><mn>2</mn></mfrac></math></mjx-assistive-mml></mjx-container>
    <svg style="display:none"><defs><path id="mathjax-external-path" d="M0,0 L10,0 L5,12 Z"/></defs></svg>
    <mjx-container display="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><use href="#mathjax-external-path"/></svg><mjx-assistive-mml><math><mi>x</mi></math></mjx-assistive-mml></mjx-container>
    <h2>Paragrafi brevi e medi</h2>${paragraphs}
    <h2>Tabella delle simulazioni</h2><div style="overflow:auto;display:flex"><table><thead><tr><th>SIMULAZIONE</th><th>DESCRIZIONE</th><th>RISULTATO</th></tr></thead><tbody>${rows}</tbody></table></div>
    <h2>Blocco R breve</h2><pre><code>SHORT_CODE_BEGIN\nset.seed(123)\nx &lt;- rnorm(1000)\nmean(x)\nsd(x)\nSHORT_CODE_END</code></pre>
    <h2>Paragrafo molto lungo</h2><p>LONG_BEGIN ${text.repeat(65)} LONG_END</p>
    <h2>Codice lungo</h2><pre><code>${Array.from({ length: 100 }, (_, i) => `value_${i} &lt;- rnorm(10) # CODE_LINE_${i}`).join('\n')}</code></pre>
    <h2>Figura vettoriale</h2><figure><svg width="600" height="180" viewBox="0 0 600 180"><rect x="15" y="15" width="570" height="150" fill="#eef2ff"/><path d="M30 140 Q150 0 300 110 T570 35" fill="none" stroke="#1d4ed8" stroke-width="3"/><text x="30" y="45" fill="#17202b">Simulazioni Monte Carlo</text></svg><figcaption>Grafico di prova</figcaption></figure>
    <img alt="Immagine locale" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Crect width='100' height='40' fill='%2394a3b8'/%3E%3C/svg%3E">
    <button>NON_ESPORTARE_CONTROLLO</button><div onclick="window.unwanted=true">Contenuto senza eventi</div>
  </div></div><div data-message-author-role="assistant" id="other"><p>SECOND_RESPONSE_ONLY</p></div></body></html>`;
fs.writeFileSync(path.join(root, 'tests/fixture.html'), fixture);

async function installScripts(page) {
  await page.evaluate(() => {
    window.chrome = { runtime: { onMessage: { addListener: listener => { window.receiveMessage = listener; } } }, storage: { local: {
      get: (defaults, callback) => callback(defaults), set: value => { window.savedSettings = value; }
    } } };
  });
  for (const file of ['vendor/katex-assets.js', 'print.js', 'content.js']) {
    await page.addScriptTag({ path: path.join(extension, file) });
  }
}

async function main() {
  const defaultChrome = process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || defaultChrome, headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    await context.addInitScript(() => {
      window.printCalls = 0;
      window.print = () => { window.printCalls++; };
    });
    const requests = [];
    const errors = [];
    context.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    const page = await context.newPage();
    await page.setContent(fixture);
    await installScripts(page);
    // Use the real export buttons and settings panel, including repeat clicks.
    assert.equal(await page.locator('.chatpdf-inline-button').count(), 2);
    await page.locator('#selected + .chatpdf-inline-button').click();
    const popupPromise = page.waitForEvent('popup');
    const started = Date.now();
    await page.locator('.chatpdf-primary').click();
    const preview = await popupPromise;
    await preview.waitForFunction(() => document.documentElement.dataset.chatpdfReady === 'true', { timeout: 15000 });
    const preparationMs = Date.now() - started;
    assert.equal(await preview.evaluate(() => window.printCalls), 0, 'No automatic or duplicate print dialog');
    const body = await preview.locator('.chatpdf-document').textContent();
    assert(!body.includes('SECOND_RESPONSE_ONLY'));
    assert(!body.includes('USER_MESSAGE_ONLY'));
    assert(!body.includes('NON_ESPORTARE_CONTROLLO'));
    assert.equal(await preview.locator('[onclick]').count(), 0);
    assert.equal(await preview.locator('.katex-html').count(), expressions.length + 1);
    assert.equal(await preview.locator('.katex-mathml').count(), expressions.length + 1);
    assert.equal(await preview.locator('mjx-assistive-mml').count(), 0);
    assert.equal(await preview.locator('mjx-container svg defs #mathjax-external-path').count(), 1);
    const fonts = await preview.evaluate(() => [...document.fonts].map(font => ({ name: font.family, status: font.status })));
    assert(fonts.some(font => font.name === 'KaTeX_Main' && font.status === 'loaded'));
    assert(!fonts.some(font => font.status === 'error'));
    const mathSizes = await preview.locator('.chatpdf-math-block').evaluateAll(blocks => blocks.map(block => {
      const math = block.querySelector('.katex-html') || block.firstElementChild;
      const range = document.createRange();
      range.selectNodeContents(math);
      return { actual: range.getBoundingClientRect().width, available: block.getBoundingClientRect().width };
    }));
    assert(mathSizes.every(size => size.actual <= size.available + 2), JSON.stringify(mathSizes));
    await preview.getByRole('button', { name: 'Stampa / Salva PDF' }).click();
    assert.equal(await preview.evaluate(() => window.printCalls), 1);
    await preview.screenshot({ path: path.join(output, 'preview.png'), fullPage: false });
    const pdf = path.join(output, 'regression-default.pdf');
    await preview.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
    const parsed = readPDF(pdf);
    const pages = parsed.pages;
    const pageFor = marker => pages.findIndex(page => page.replace(/\s+/g, '').includes(marker));
    for (let i = 0; i < 24; i++) {
      const key = `P${String(i).padStart(2, '0')}`;
      assert(pageFor(`${key}_BEGIN`) >= 0);
      assert.equal(pageFor(`${key}_BEGIN`), pageFor(`${key}_END`), `Paragraph ${key} split across pages`);
    }
    for (let i = 0; i < 65; i++) {
      assert(pageFor(`R${i}_BEGIN`) >= 0, `Missing table row ${i}`);
      assert.equal(pageFor(`R${i}_BEGIN`), pageFor(`R${i}_END`), `Table row ${i} split`);
    }
    assert.equal(pageFor('SHORT_CODE_BEGIN'), pageFor('SHORT_CODE_END'));
    assert(pageFor('LONG_END') > pageFor('LONG_BEGIN'), 'Very long paragraph must be allowed to split');
    assert(pageFor('CODE_LINE_99') > pageFor('CODE_LINE_0'), 'Long code must span pages');
    assert(pages.filter(text => text.replace(/\s+/g, '').includes('SIMULAZIONE')).length >= 2, 'Repeat table headers');
    assert.equal(pageFor('Paragrafibrevie medi'.replace(/\s+/g, '')), pageFor('P00_BEGIN'), 'Heading stays with its paragraph');
    assert.equal(pageFor('BloccoRbreve'), pageFor('SHORT_CODE_BEGIN'), 'Heading stays with short code');
    assert(!pages.some(text => text.includes('Stampa / Salva PDF')), 'Toolbar must not print');
    assert(parsed.sizes.every(([width, height]) => Math.abs(width - 595.28) < 1 && Math.abs(height - 841.89) < 1), 'A4 portrait');

    // Stress layout with 12 pt, wide spacing and larger margins, plus a narrow tab.
    await preview.close();
    await page.locator('#selected + .chatpdf-inline-button').click();
    const controls = page.locator('.chatpdf-select');
    await controls.nth(1).selectOption('12');
    await controls.nth(2).selectOption('20');
    await controls.nth(3).selectOption('wide');
    const nextPopup = page.waitForEvent('popup');
    await page.locator('.chatpdf-primary').click();
    const large = await nextPopup;
    await large.setViewportSize({ width: 500, height: 800 });
    await large.waitForFunction(() => document.documentElement.dataset.chatpdfReady === 'true');
    const largePdf = path.join(output, 'regression-large.pdf');
    await large.pdf({ path: largePdf, preferCSSPageSize: true, printBackground: true });
    const largePages = readPDF(largePdf).pages;
    for (let i = 0; i < 24; i++) {
      const key = `P${String(i).padStart(2, '0')}`;
      assert.equal(largePages.findIndex(text => text.includes(`${key}_BEGIN`)), largePages.findIndex(text => text.includes(`${key}_END`)), `${key} split at 12 pt`);
    }
    await large.close();
    assert.equal(await page.locator('#chatpdf-full-button').count(), 0, 'Whole-chat export removed');
    // Explicit selection exports the same rendered formulas through the same engine.
    await page.evaluate(() => {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('#selected'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.querySelector('#selected').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
      window.getSelection().removeAllRanges();
      window.receiveMessage({ type: 'chatpdf-export-selection' });
    });
    const selectionPopup = page.waitForEvent('popup');
    await page.locator('.chatpdf-primary').click();
    const selected = await selectionPopup;
    await selected.waitForFunction(() => document.documentElement.dataset.chatpdfReady === 'true');
    const selectionText = await selected.locator('.chatpdf-document').textContent();
    assert(!selectionText.includes('USER_MESSAGE_ONLY') && !selectionText.includes('SECOND_RESPONSE_ONLY'));
    assert(selectionText.includes('P23_END'));
    assert.equal(await selected.locator('.katex-html').count(), expressions.length + 1);
    assert.equal(await selected.locator('.chatpdf-turn').count(), 1);
    assert.deepEqual(requests, [], 'Export must not fetch math fonts or CSS from the network');
    assert.deepEqual(errors, []);
    // A server that never finishes an image must not leave export stuck.
    await context.route('https://images.test/unavailable.svg', () => {});
    const unavailable = await context.newPage();
    await unavailable.setContent('<div data-message-author-role="assistant"><p>Immagine non disponibile</p><img src="https://images.test/unavailable.svg"></div>', { waitUntil: 'domcontentloaded' });
    await installScripts(unavailable);
    await unavailable.locator('.chatpdf-inline-button').click();
    const delayedPopup = unavailable.waitForEvent('popup');
    await unavailable.locator('.chatpdf-primary').click();
    const delayed = await delayedPopup;
    await delayed.waitForFunction(() => document.documentElement.dataset.chatpdfReady === 'true', null, { timeout: 10000 });
    assert((await delayed.locator('#chatpdf-print-status').textContent()).includes('immagine non è ancora disponibile'));
    assert(await delayed.getByRole('button', { name: 'Stampa / Salva PDF' }).isEnabled());
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ status: 'PASS', preparationMs, defaultPages: pages.length,
      largePages: largePages.filter(text => text.trim()).length, paragraphsChecked: 24,
      tableRowsChecked: 65, mathExamples: expressions.length + 1, offlineMathAssets: true, imageTimeout: 'PASS',
      browser: await browser.version() }, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
