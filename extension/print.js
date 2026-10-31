(() => {
  'use strict';

  const MATH = '.katex, .katex-display, mjx-container, math, .MathJax';
  const REMOVE = 'button,input,textarea,select,form,nav,script,style,link,iframe,object,embed,video,audio,[data-chatpdf-owned],[contenteditable="true"]';
  const PX_PER_MM = 96 / 25.4;
  const yieldToBrowser = () => globalThis.scheduler?.yield
    ? globalThis.scheduler.yield()
    : new Promise(resolve => setTimeout(resolve, 0));

  function safeSettings(input) {
    return {
      font: ['9', '9.5', '10', '10.5', '11', '12'].includes(String(input.font)) ? Number(input.font) : 10,
      margin: ['10', '12', '15', '18', '20'].includes(String(input.margin)) ? Number(input.margin) : 15,
      spacing: { compact: 1.15, normal: 1.3, wide: 1.45 }[input.spacing] || 1.15,
      compact: input.mode !== 'faithful'
    };
  }

  function printStyles(settings) {
    return `
      :root { color-scheme: light; }
      @page { size: A4 portrait; margin: ${settings.margin}mm; }
      html, body { margin: 0; background: #e8edf3; color: #17202b; }
      body { font-family: Arial, "Segoe UI", sans-serif;
        -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #chatpdf-print-toolbar { box-sizing: border-box; background: white; border-bottom: 1px solid #d8e0eb;
        padding: 12px 20px; position: sticky; top: 0; z-index: 1000; display: flex;
        align-items: center; justify-content: space-between; gap: 16px; font: 13px/1.4 Arial, sans-serif; }
      #chatpdf-print-toolbar button { border: 0; border-radius: 8px; padding: 10px 17px;
        background: #1d4ed8; color: white; font-weight: 700; cursor: pointer; flex-shrink: 0; }
      #chatpdf-print-toolbar button:disabled { opacity: .55; cursor: wait; }
      #chatpdf-print-status { white-space: pre-line; }
      .chatpdf-sheet { box-sizing: border-box; width: 210mm; margin: 20px auto; min-height: 297mm;
        padding: ${settings.margin}mm; background: white; box-shadow: 0 5px 24px #1e293b29; }
      .chatpdf-document { color: #111827; font: ${settings.font}pt/${settings.spacing} Arial, "Segoe UI", sans-serif;
        overflow-wrap: break-word; overflow: visible; }
      .chatpdf-turn, .chatpdf-content { display: block; min-width: 0; overflow: visible; }
      .chatpdf-content div:not(.katex *):not(mjx-container *):not(svg *) { min-width: 0; }
      .chatpdf-turn + .chatpdf-turn { margin-top: 12pt; }
      .chatpdf-document p { margin: 0 0 ${settings.compact ? '.42em' : '.72em'}; }
      .chatpdf-document p, .chatpdf-document li { orphans: 3; widows: 3; }
      .chatpdf-document ul, .chatpdf-document ol { margin: .3em 0 .55em; padding-left: 1.65em; }
      .chatpdf-document li { margin: .15em 0; }
      .chatpdf-document h1, .chatpdf-document h2, .chatpdf-document h3,
      .chatpdf-document h4, .chatpdf-document h5, .chatpdf-document h6 {
        font-weight: 700; line-height: 1.18; margin: ${settings.compact ? '.75em' : '1em'} 0 .35em;
        break-inside: avoid; break-after: avoid-page; page-break-after: avoid; }
      .chatpdf-document h1 { font-size: 1.5em; }
      .chatpdf-document h2 { font-size: 1.3em; }
      .chatpdf-document h3 { font-size: 1.15em; }
      .chatpdf-document h4, .chatpdf-document h5, .chatpdf-document h6 { font-size: 1em; }
      .chatpdf-document .chatpdf-document-title { margin-top: 0; }
      .chatpdf-document .chatpdf-speaker { border-bottom: 1px solid #cbd5e1; color: #475569;
        font-size: 1em; padding-bottom: 4pt; }
      .chatpdf-document table { border-collapse: collapse; width: 100%; table-layout: auto;
        font-size: .87em; break-inside: auto; }
      .chatpdf-document thead { display: table-header-group; }
      .chatpdf-document tfoot { display: table-footer-group; }
      .chatpdf-document tr { break-inside: avoid; page-break-inside: avoid; }
      .chatpdf-document td, .chatpdf-document th { border: 1px solid #cbd5e1; padding: 4px 5px;
        overflow-wrap: anywhere; }
      .chatpdf-document th { overflow-wrap: normal; }
      .chatpdf-document pre { box-sizing: border-box; font: .85em/1.25 Consolas, "Courier New", monospace;
        white-space: pre-wrap; overflow-wrap: anywhere; padding: 7pt; margin: .5em 0;
        background: #f1f5f9; border-radius: 4px; orphans: 3; widows: 3; }
      .chatpdf-document pre code { font: inherit; white-space: inherit; }
      .chatpdf-document code:not(pre code) { font: .94em Consolas, "Courier New", monospace;
        background: #f1f5f9; padding: 0 2px; border-radius: 3px; }
      .chatpdf-document img, .chatpdf-document svg:not(.katex svg):not(mjx-container svg) {
        max-width: 100%; height: auto; max-height: ${297 - 2 * settings.margin}mm; object-fit: contain; }
      .chatpdf-document img, .chatpdf-document figure { break-inside: avoid-page; }
      .chatpdf-document figure { margin: .6em 0; }
      .chatpdf-document blockquote { margin: .35em 0; padding: 3pt 8pt; border-left: 2pt solid #94a3b8; }
      .chatpdf-document a { color: #1d4ed8; text-decoration: underline; }
      /* Never apply global width, box-sizing, font or SVG resets to KaTeX internals. */
      .chatpdf-document .katex { color: #111827; white-space: nowrap; overflow-wrap: normal; }
      .chatpdf-document .katex-display { margin: .55em 0 .65em; }
      .chatpdf-document .chatpdf-math-block { display: block; text-align: center; margin: .55em 0 .65em;
        break-inside: avoid-page; page-break-inside: avoid; overflow: visible; }
      .chatpdf-document .chatpdf-math-block > .katex-display { margin: 0; }
      .chatpdf-document .chatpdf-math-inline { display: inline-block; white-space: nowrap; }
      .chatpdf-document .chatpdf-native-math { font-family: "Cambria Math", "STIX Two Math", math;
        font-size: 1.1em; }
      .chatpdf-document .chatpdf-keep { break-inside: avoid-page; page-break-inside: avoid; }
      .chatpdf-document .chatpdf-split { break-inside: auto; page-break-inside: auto; }
      .chatpdf-content > :first-child { margin-top: 0; }
      @media print {
        html, body { margin: 0 !important; background: white !important; }
        #chatpdf-print-toolbar { display: none !important; }
        .chatpdf-sheet { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
      }
    `;
  }

  function wrapMath(node, display) {
    const wrapper = node.ownerDocument.createElement('span');
    wrapper.className = display ? 'chatpdf-math-block' : 'chatpdf-math-inline';
    node.replaceWith(wrapper);
    wrapper.appendChild(node);
    return wrapper;
  }

  function normalizeMath(root, warnings) {
    // Keep KaTeX's rendered HTML AND its original inline metrics. The complete
    // stylesheet and fonts are bundled locally, including fraction/radical SVGs.
    for (const katex of root.querySelectorAll('.katex')) {
      if (katex.parentElement?.closest('.katex')) continue;
      const display = katex.closest('.katex-display');
      const target = display && root.contains(display) ? display : katex;
      if (!target.parentElement?.closest('.chatpdf-math-block, .chatpdf-math-inline')) {
        wrapMath(target, !!display);
      }
    }
    for (const mjx of [...root.querySelectorAll('mjx-container, .MathJax')]) {
      if (!root.contains(mjx)) continue;
      const display = mjx.getAttribute('display') === 'true' || mjx.classList.contains('MathJax_Display');
      // MathJax SVG has exact glyph paths, so preserve it when available.
      if (mjx.querySelector('svg')) {
        mjx.querySelectorAll('mjx-assistive-mml').forEach(node => node.remove());
        wrapMath(mjx, display);
        continue;
      }
      const sourceMath = mjx.querySelector('math');
      if (sourceMath) {
        const math = sourceMath.cloneNode(true);
        math.removeAttribute('style');
        math.classList.add('chatpdf-native-math');
        math.setAttribute('display', display ? 'block' : 'inline');
        mjx.replaceWith(math);
        wrapMath(math, display);
      } else {
        warnings.add('Una formula MathJax non include SVG o MathML: controllane la resa prima di salvare.');
        wrapMath(mjx, display);
      }
    }
    for (const math of root.querySelectorAll('math')) {
      if (math.closest('.katex, .chatpdf-math-block, .chatpdf-math-inline')) continue;
      math.classList.add('chatpdf-native-math');
      wrapMath(math, math.getAttribute('display') === 'block');
    }
  }

  function copySVGReferences(root, sourceDocument) {
    for (const svg of root.querySelectorAll('svg')) {
      const pending = [...svg.querySelectorAll('use')];
      const seen = new Set();
      const defs = sourceDocument.createElementNS('http://www.w3.org/2000/svg', 'defs');
      for (let i = 0; i < pending.length && i < 1000; i++) {
        const href = pending[i].getAttribute('href') || pending[i].getAttribute('xlink:href');
        if (!href?.startsWith('#') || seen.has(href)) continue;
        seen.add(href);
        if ([...svg.querySelectorAll('[id]')].some(node => node.id === href.slice(1))) continue;
        const referenced = sourceDocument.getElementById(href.slice(1));
        if (!referenced) continue;
        const copy = referenced.cloneNode(true);
        defs.appendChild(copy);
        pending.push(...copy.querySelectorAll('use'));
      }
      if (defs.childNodes.length) svg.prepend(defs);
    }
  }

  async function cloneForPrint(source, warnings) {
    const result = source.cloneNode(true);
    // Arrays are paired before any replacements/removals. Avoid getComputedStyle
    // for thousands of KaTeX/prose spans; only SVG and custom MathJax need it.
    const sources = [source, ...source.querySelectorAll('*')];
    const copies = [result, ...result.querySelectorAll('*')];
    for (let i = 0; i < sources.length; i++) {
      if (i && i % 250 === 0) await yieldToBrowser();
      const original = sources[i];
      const copy = copies[i];
      const math = original.closest(MATH);
      const vector = original.closest('svg');
      if (!math && !vector) {
        // Remove application sizing, flex/grid, scroll and sticky styles that
        // otherwise inhibit fragmentation or retain the chat's narrow column.
        const weight = copy.style?.fontWeight;
        const italic = copy.style?.fontStyle;
        const align = copy.style?.textAlign;
        copy.removeAttribute('style');
        if (weight) copy.style.fontWeight = weight;
        if (italic) copy.style.fontStyle = italic;
        if (align) copy.style.textAlign = align;
      } else if (!original.closest('.katex, .katex-display, math')) {
        const css = getComputedStyle(original);
        const props = vector
          ? ['fill', 'stroke', 'stroke-width', 'color', 'font-family', 'font-size', 'font-weight', 'opacity']
          : ['display', 'position', 'top', 'left', 'vertical-align', 'height', 'width', 'font-family', 'font-size', 'padding', 'margin'];
        for (const property of props) copy.style.setProperty(property, css.getPropertyValue(property));
      }
      if (original.localName === 'img') {
        copy.src = original.currentSrc || original.src;
        copy.removeAttribute('srcset');
        copy.removeAttribute('sizes');
        copy.loading = 'eager';
      }
      if (original.localName === 'canvas') {
        try {
          const image = document.createElement('img');
          image.src = original.toDataURL('image/png');
          image.alt = original.getAttribute('aria-label') || 'Grafico';
          copy.replaceWith(image);
        } catch (_) {
          copy.replaceWith(document.createTextNode('[Grafico non esportabile]'));
          warnings.add('Un grafico protetto non può essere copiato nel PDF.');
        }
      }
    }
    copySVGReferences(result, source.ownerDocument);
    normalizeMath(result, warnings);
    result.querySelectorAll(REMOVE).forEach(node => node.remove());
    for (const node of [result, ...result.querySelectorAll('*')]) {
      for (const attribute of [...node.attributes]) {
        if (/^on/i.test(attribute.name) || attribute.name === 'srcdoc') node.removeAttribute(attribute.name);
        if (['href', 'src', 'xlink:href'].includes(attribute.name) && /^\s*javascript:/i.test(attribute.value)) {
          node.removeAttribute(attribute.name);
        }
      }
    }
    return result;
  }

  function withTimeout(promise, ms) {
    let timer;
    return Promise.race([promise, new Promise(resolve => {
      timer = setTimeout(() => resolve(false), ms);
    })]).finally(() => clearTimeout(timer));
  }

  async function waitForAssets(doc, warnings) {
    // Trigger layout before fonts.ready: otherwise it can resolve before any
    // KaTeX font has actually been requested by the new document.
    void doc.body.offsetHeight;
    const fonts = withTimeout(doc.fonts.ready.then(() => true), 5000);
    const images = [...doc.images].map(async img => {
      if (!img.complete) {
        let finish;
        const loaded = new Promise(resolve => {
          finish = () => resolve(true);
          img.addEventListener('load', finish, { once: true });
          img.addEventListener('error', finish, { once: true });
        });
        await withTimeout(loaded, 5000);
        img.removeEventListener('load', finish);
        img.removeEventListener('error', finish);
      }
      if (!img.complete || !img.naturalWidth) warnings.add('Un’immagine non è ancora disponibile. Attendi e riapri l’anteprima se manca dal documento.');
    });
    const [fontsReady] = await Promise.all([fonts, ...images]);
    if (!fontsReady || [...doc.fonts].some(font => font.status === 'error')) {
      warnings.add('Alcuni caratteri non sono pronti: controlla le formule prima di stampare.');
    }
  }

  function preparePagination(content, settings, warnings) {
    const pageHeight = (297 - 2 * settings.margin) * PX_PER_MM;
    // Measure at the exact A4 content width, independent of the tab's width.
    // Resize display equations by font size (not transform) so layout follows.
    const equations = [...content.querySelectorAll('.chatpdf-math-block, .chatpdf-math-inline')];
    for (const wrapper of equations) wrapper.style.removeProperty('font-size');
    for (const wrapper of equations) {
      const math = wrapper.firstElementChild;
      let visual = math;
      if (math.matches('.katex-display')) visual = math.querySelector('.katex-html') || math;
      const range = content.ownerDocument.createRange();
      range.selectNodeContents(visual);
      const width = Math.max(range.getBoundingClientRect().width, visual.scrollWidth);
      let container = wrapper;
      if (wrapper.classList.contains('chatpdf-math-inline')) {
        container = wrapper.parentElement;
        while (container !== content && getComputedStyle(container).display === 'inline') {
          container = container.parentElement;
        }
      }
      const available = container.getBoundingClientRect().width;
      if (width > available && available > 0) {
        // Keep even wide matrices entirely on paper; flag unusually small text.
        const ratio = available / width * .98;
        wrapper.style.fontSize = `${ratio}em`;
        if (ratio < .65) warnings.add('Una formula molto larga è stata ridotta: verificane la leggibilità.');
      }
    }
    // Batch reads, then writes: no layout recalculation for every paragraph.
    const blocks = [...content.querySelectorAll('p, li, pre, blockquote, figure, tr')].map(node => {
      const height = node.getBoundingClientRect().height;
      const limit = node.matches('tr, figure') ? pageHeight : pageHeight * .40;
      return { node, keep: height <= limit };
    });
    for (const { node, keep } of blocks) {
      node.classList.toggle('chatpdf-keep', keep);
      node.classList.toggle('chatpdf-split', !keep);
    }
  }

  function open({ roles, scope, settings: input = {}, title = 'Appunti ChatGPT' }) {
    // Open synchronously in the click handler, then yield during preparation.
    const preview = window.open('', '_blank');
    if (!preview) {
      alert('Chrome ha bloccato l’anteprima. Consenti i popup per chatgpt.com e riprova.');
      return null;
    }
    const settings = safeSettings(input);
    const warnings = new Set();
    const doc = preview.document;
    doc.open();
    doc.write('<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>ChatPDF - Anteprima</title></head><body></body></html>');
    doc.close();
    doc.title = title;
    const style = doc.createElement('style');
    style.textContent = (globalThis.ChatPDFMathCSS || '') + '\n' + printStyles(settings);
    doc.head.appendChild(style);
    const toolbar = doc.createElement('div');
    toolbar.id = 'chatpdf-print-toolbar';
    const status = doc.createElement('span');
    status.id = 'chatpdf-print-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Preparazione del documento…';
    const button = doc.createElement('button');
    button.type = 'button';
    button.textContent = 'Stampa / Salva PDF';
    button.disabled = true;
    toolbar.append(status, button);
    doc.body.appendChild(toolbar);
    const sheet = doc.createElement('div');
    sheet.className = 'chatpdf-sheet';
    const content = doc.createElement('main');
    content.className = 'chatpdf-document';
    sheet.appendChild(content);
    doc.body.appendChild(sheet);

    let printing = false;
    button.addEventListener('click', () => {
      if (printing || button.disabled || preview.closed) return;
      printing = true;
      button.disabled = true;
      try {
        // Assets may have completed since a previous timeout.
        preparePagination(content, settings, warnings);
        preview.focus();
        preview.print();
      } catch (_) {
        status.textContent = 'Chrome non ha aperto la stampa. Riprova con Stampa / Salva PDF oppure Ctrl+P.';
      } finally {
        printing = false;
        button.disabled = false;
      }
    });

    const ready = (async () => {
      try {
        await yieldToBrowser();
        if (scope === 'all') {
          const heading = doc.createElement('h1');
          heading.className = 'chatpdf-document-title';
          heading.textContent = title;
          content.appendChild(heading);
        }
        for (let i = 0; i < roles.length; i++) {
          if (preview.closed) return;
          status.textContent = `Preparazione del documento… ${i + 1}/${roles.length}`;
          const { node, kind } = roles[i];
          const section = doc.createElement('section');
          section.className = 'chatpdf-turn';
          if (scope === 'all') {
            const speaker = doc.createElement('h2');
            speaker.className = 'chatpdf-speaker';
            speaker.textContent = kind === 'assistant' ? 'ChatGPT' : 'Utente';
            section.appendChild(speaker);
          }
          const body = doc.createElement('div');
          body.className = 'chatpdf-content';
          body.appendChild(doc.importNode(await cloneForPrint(node, warnings), true));
          section.appendChild(body);
          content.appendChild(section);
          await yieldToBrowser();
        }
        if (preview.closed) return;
        status.textContent = 'Controllo di formule, immagini e interruzioni di pagina…';
        await waitForAssets(doc, warnings);
        if (preview.closed) return;
        preparePagination(content, settings, warnings);
        if (!globalThis.ChatPDFMathCSS && content.querySelector('.katex')) {
          throw new Error('Caratteri matematici mancanti. Ricarica l’estensione e la scheda ChatGPT.');
        }
        const updateStatus = () => {
          status.textContent = 'Documento pronto · Premi Stampa / Salva PDF per vedere le pagine.' +
            (warnings.size ? '\n' + [...warnings].join('\n') : '');
        };
        updateStatus();
        preview.addEventListener('beforeprint', () => {
          preparePagination(content, settings, warnings);
          updateStatus();
        });
        button.disabled = false;
        doc.documentElement.dataset.chatpdfReady = 'true';
      } catch (error) {
        if (!preview.closed) status.textContent = `Esportazione non completata: ${error.message || 'errore imprevisto'}`;
      }
    })();
    return { preview, ready };
  }

  globalThis.ChatPDFPrint = { open };
})();
