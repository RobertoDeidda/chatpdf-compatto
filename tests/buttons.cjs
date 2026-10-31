const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const contentScript = path.resolve(__dirname, '../extension/content.js');
const button = '.chatpdf-inline-button';
const baseline = '<header><button>Condividi</button></header><main><article data-testid="conversation-turn-1"><div data-message-author-role="assistant" data-message-id="a1" id="answer"><p>PRIMA_RISPOSTA</p></div></article></main>';
const tests = [];
const test = (name, run) => tests.push({ name, run });
const waitForButtons = (page, count, within = 'body') => page.waitForFunction(
  ({ count, within }) => document.querySelectorAll(`${within} .chatpdf-inline-button`).length === count,
  { count, within }, { timeout: 1600 });

async function exportButton(page, selector) {
  await page.locator(selector).click();
  await page.locator('.chatpdf-primary').click();
  return page.evaluate(() => window.exports.at(-1));
}

test('Messaggio nuovo popolato con un nodo di testo', async page => {
  await page.evaluate(() => {
    const message = document.createElement('div');
    message.id = 'new';
    message.dataset.messageAuthorRole = 'assistant';
    document.querySelector('main').append(message);
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('#new').append(document.createTextNode('NUOVA_RISPOSTA')));
  await waitForButtons(page, 2);
  const output = await exportButton(page, '#new + .chatpdf-inline-button');
  assert.deepEqual(output.texts, ['NUOVA_RISPOSTA']);
});

test('Streaming che modifica soltanto characterData', async page => {
  await page.evaluate(() => {
    const message = document.createElement('div');
    message.id = 'stream';
    message.dataset.messageAuthorRole = 'assistant';
    message.append(document.createTextNode(''));
    document.querySelector('main').append(message);
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => { document.querySelector('#stream').firstChild.data = 'STREAM_COMPLETO'; });
  await waitForButtons(page, 2);
  const output = await exportButton(page, '#stream + .chatpdf-inline-button');
  assert.deepEqual(output.texts, ['STREAM_COMPLETO']);
});

test('Pulsante rimosso da React e ripristinato senza nuove risposte', async page => {
  await page.locator(button).evaluate(node => node.remove());
  await waitForButtons(page, 1);
  assert.deepEqual((await exportButton(page, button)).texts, ['PRIMA_RISPOSTA']);
});

test('Formati di messaggio diversi nella stessa chat', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend',
    '<article data-testid="conversation-turn-2"><div class="markdown">RISPOSTA_MARKDOWN</div></article>' +
    '<article data-testid="conversation-turn-3"><div class="DilResponseRoot">RISPOSTA_DIL</div></article>' +
    '<article data-testid="conversation-turn-4"><div data-testid="user-message"><div class="markdown">DOMANDA_UTENTE</div></div></article>'));
  await waitForButtons(page, 3);
  const output = await exportButton(page, '[data-testid="conversation-turn-2"] .chatpdf-inline-button');
  assert.deepEqual(output.texts, ['RISPOSTA_MARKDOWN']);
  assert.equal(await page.locator('[data-testid="conversation-turn-4"] .chatpdf-inline-button').count(), 0);
});

test('Riconoscimento dopo modifica di un attributo', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend', '<div id="late">RISPOSTA_TARDIVA</div>'));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('#late').setAttribute('data-message-author-role', 'assistant'));
  await waitForButtons(page, 2);
});

test('Contenuto sostituito con il vecchio pulsante ancora presente', async page => {
  await page.evaluate(() => {
    const old = document.querySelector('#answer');
    const next = old.cloneNode(true);
    next.textContent = 'RISPOSTA_AGGIORNATA';
    old.replaceWith(next);
  });
  await page.waitForTimeout(700);
  assert.equal(await page.locator(button).count(), 1);
  assert.deepEqual((await exportButton(page, button)).texts, ['RISPOSTA_AGGIORNATA']);
});

test('Pulsante copiato dal DOM senza listener', async page => {
  await page.locator(button).evaluate(node => node.replaceWith(node.cloneNode(true)));
  await page.waitForTimeout(700);
  assert.equal(await page.locator(button).count(), 1);
  assert.deepEqual((await exportButton(page, button)).texts, ['PRIMA_RISPOSTA']);
});

test('Aggiornamenti continui non rimandano indefinitamente il pulsante', async page => {
  await page.evaluate(() => {
    const message = document.createElement('div');
    message.id = 'continuous';
    message.dataset.messageAuthorRole = 'assistant';
    document.querySelector('main').append(message);
    window.streamTimer = setInterval(() => {
      const chunk = document.createElement('span');
      chunk.textContent = 'testo ';
      message.append(chunk);
    }, 30);
  });
  await waitForButtons(page, 2);
  await page.evaluate(() => clearInterval(window.streamTimer));
});

test('Risposta con più blocchi DIL: un pulsante, tutto il contenuto', async page => {
  await page.evaluate(() => {
    document.querySelector('#answer').innerHTML = '<div class="DilResponseRoot"><p>PARTE_UNO</p></div><div class="DilResponseRoot"><p>PARTE_DUE</p></div>';
  });
  await page.waitForTimeout(700);
  assert.equal(await page.locator(button).count(), 1);
  const output = await exportButton(page, button);
  assert.equal(output.texts.length, 1);
  assert(output.texts[0].includes('PARTE_UNO') && output.texts[0].includes('PARTE_DUE'));
});

test('Risposta sostituita mentre il pannello di esportazione è aperto', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend', '<article data-testid="conversation-turn-2"><div data-message-author-role="assistant" data-message-id="a2">ALTRA_RISPOSTA</div></article>'));
  await waitForButtons(page, 2);
  await page.locator('#answer + .chatpdf-inline-button').click();
  await page.evaluate(() => {
    const node = document.querySelector('#answer');
    const replacement = node.cloneNode(true);
    replacement.textContent = 'TESTO_FINALE_CORRETTO';
    node.replaceWith(replacement);
  });
  await page.locator('.chatpdf-primary').click();
  assert.deepEqual(await page.evaluate(() => window.exports.at(-1)?.texts), ['TESTO_FINALE_CORRETTO']);
});

test('Una risposta rimossa non viene sostituita con un’altra per errore', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend', '<article data-testid="conversation-turn-2"><div data-message-author-role="assistant" data-message-id="a2">NON_ESPORTARE_QUESTA</div></article>'));
  await waitForButtons(page, 2);
  await page.locator('#answer + .chatpdf-inline-button').click();
  await page.evaluate(() => document.querySelector('[data-testid="conversation-turn-1"]').remove());
  await page.locator('.chatpdf-primary').click();
  assert.equal(await page.evaluate(() => window.exports.length), 0);
  assert.equal(await page.evaluate(() => window.alerts.length), 1);
});

test('Solo esportazione singola con marcatori misti', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend',
    '<article data-testid="conversation-turn-2"><div data-testid="user-message">DOMANDA</div></article>' +
    '<article data-testid="conversation-turn-3"><div class="markdown">RISPOSTA_NUOVA</div></article>'));
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#chatpdf-full-button').count(), 0);
  const output = await exportButton(page, '[data-testid="conversation-turn-3"] .chatpdf-inline-button');
  assert.deepEqual(output.texts, ['RISPOSTA_NUOVA']);
  assert.deepEqual(output.kinds, ['assistant']);
});

test('Risposta senza ID del messaggio sostituita nello stesso turno', async page => {
  await page.evaluate(() => document.querySelector('#answer').removeAttribute('data-message-id'));
  await page.locator(button).click();
  await page.evaluate(() => {
    const node = document.querySelector('#answer');
    const replacement = node.cloneNode(true);
    replacement.textContent = 'STESSO_TURNO_AGGIORNATO';
    node.replaceWith(replacement);
  });
  await page.locator('.chatpdf-primary').click();
  assert.deepEqual(await page.evaluate(() => window.exports.at(-1)?.texts), ['STESSO_TURNO_AGGIORNATO']);
});

test('Ricostruzione dell’intera conversazione e dei suoi controlli', async page => {
  await page.evaluate(() => {
    document.querySelector('main').innerHTML = '<article data-testid="conversation-turn-9"><div data-message-author-role="assistant" data-message-id="a9">NUOVA_CONVERSAZIONE</div></article>';
    const header = document.querySelector('header');
    header.replaceWith(header.cloneNode(true));
  });
  await page.waitForTimeout(700);
  assert.equal(await page.locator(button).count(), 1);
  assert.deepEqual((await exportButton(page, button)).texts, ['NUOVA_CONVERSAZIONE']);
  assert.equal(await page.locator('#chatpdf-full-button').count(), 0);
});

test('Rimozione immediata di un nodo di testo e nessun ciclo di reinserimento', async page => {
  await page.evaluate(() => {
    const text = document.querySelector('#answer p').firstChild;
    text.data = 'DA_RIMUOVERE';
    text.remove();
    document.querySelector('#answer p').textContent = 'RISPOSTA_FINALE';
    window.controlMutations = 0;
    new MutationObserver(records => {
      window.controlMutations += records.filter(record => [...record.addedNodes, ...record.removedNodes]
        .some(node => node.nodeType === 1 && node.matches('.chatpdf-inline-button'))).length;
    }).observe(document.body, { childList: true, subtree: true });
  });
  await page.waitForTimeout(700);
  assert.equal(await page.locator(button).count(), 1);
  assert.equal(await page.evaluate(() => window.controlMutations), 0);
  assert.deepEqual((await exportButton(page, button)).texts, ['RISPOSTA_FINALE']);
});

test('Nessun pulsante nel campo di scrittura o nelle finestre di ChatGPT', async page => {
  await page.evaluate(() => document.body.insertAdjacentHTML('beforeend',
    '<form><div class="markdown" contenteditable="true">BOZZA_UTENTE</div></form>' +
    '<div role="dialog"><div class="prose">AIUTO_INTERFACCIA</div></div>'));
  await page.waitForTimeout(700);
  assert.equal(await page.locator(button).count(), 1);
  assert.deepEqual((await exportButton(page, button)).texts, ['PRIMA_RISPOSTA']);
});

test('Domanda e risposta nello stesso contenitore con ID condiviso', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend',
    '<article data-testid="conversation-turn-2" data-message-id="shared"><div data-message-author-role="user">DOMANDA_NELLO_STESSO_TURNO</div>' +
    '<section><div class="markdown" id="shared-answer">RISPOSTA_SEMPLICE</div></section></article>'));
  await waitForButtons(page, 2);
  assert.deepEqual((await exportButton(page, '#shared-answer + .chatpdf-inline-button')).texts, ['RISPOSTA_SEMPLICE']);
});

test('Contenitore esterno markdown con risposta già nota e risposta senza ruolo', async page => {
  await page.evaluate(() => {
    document.querySelector('main').className = 'markdown';
    document.querySelector('main').insertAdjacentHTML('beforeend',
      '<section class="markdown" id="unmarked">RISPOSTA_SENZA_RUOLO</section>');
  });
  await waitForButtons(page, 2);
  assert.deepEqual((await exportButton(page, '#unmarked + .chatpdf-inline-button')).texts, ['RISPOSTA_SENZA_RUOLO']);
});

test('Più sezioni della risposta accanto a una domanda nello stesso turno', async page => {
  await page.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend',
    '<article data-testid="conversation-turn-2"><div data-testid="user-message">DOMANDA</div>' +
    '<section id="combined"><div class="DilResponseRoot">PRIMA_PARTE</div><div class="DilResponseRoot">SECONDA_PARTE</div></section></article>'));
  await waitForButtons(page, 2);
  assert.deepEqual((await exportButton(page, '#combined + .chatpdf-inline-button')).texts, ['PRIMA_PARTESECONDA_PARTE']);
});

test('Menu selezione: testo senza marcatori e selezione conservata aprendo il pannello', async page => {
  await page.evaluate(() => {
    document.querySelector('main').insertAdjacentHTML('beforeend', '<section id="unrecognized"><p>TESTO_NON_RICONOSCIUTO</p><p>SECONDO_PARAGRAFO</p></section>');
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#unrecognized'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.querySelector('#unrecognized').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    window.getSelection().removeAllRanges();
    window.receiveMessage({ type: 'chatpdf-export-selection' });
  });
  assert.equal(await page.locator('.chatpdf-modal h2').textContent(), 'Esporta la selezione');
  await page.locator('.chatpdf-primary').click();
  assert.deepEqual(await page.evaluate(() => window.exports.at(-1)?.texts), ['TESTO_NON_RICONOSCIUTOSECONDO_PARAGRAFO']);
  assert.equal(await page.locator('.chatpdf-selected-content').count(), 0, 'Temporary content cleaned up');
});

test('Il menu senza selezione mostra un avviso e non esporta altri messaggi', async page => {
  await page.evaluate(() => window.receiveMessage({ type: 'chatpdf-export-selection' }));
  assert.equal(await page.locator('.chatpdf-modal').count(), 0);
  assert.equal(await page.evaluate(() => window.exports.length), 0);
  assert.equal(await page.evaluate(() => window.alerts.length), 1);
});

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined),
    headless: true
  });
  let failures = 0;
  try {
    for (const { name, run } of tests) {
      const page = await browser.newPage();
      page.setDefaultTimeout(1800);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.setContent(baseline);
        await page.evaluate(() => {
          window.chrome = { runtime: { onMessage: { addListener: listener => { window.receiveMessage = listener; } } },
            storage: { local: { get: (defaults, cb) => cb(defaults), set: () => {} } } };
          window.exports = [];
          window.alerts = [];
          window.alert = text => window.alerts.push(text);
          window.ChatPDFPrint = { open: ({ roles, scope }) => window.exports.push({ scope,
            texts: roles.map(({ node }) => {
              const copy = node.cloneNode(true);
              copy.querySelectorAll('[data-chatpdf-owned]').forEach(control => control.remove());
              return copy.textContent.trim();
            }), kinds: roles.map(role => role.kind) }) };
        });
        await page.addScriptTag({ path: contentScript });
        await run(page);
        assert.deepEqual(errors, []);
        console.log(`PASS ${name}`);
      } catch (error) {
        failures++;
        console.error(`FAIL ${name}: ${error.message.split('\n').slice(0, 3).join(' ')}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`${tests.length - failures}/${tests.length} controlli superati`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
