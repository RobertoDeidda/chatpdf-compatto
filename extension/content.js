(() => {
  'use strict';

  // Avoid duplicate initialization if Chrome reinjects the script.
  if (window.__chatpdfCompattoInitialized) return;
  window.__chatpdfCompattoInitialized = true;

  const OWN = 'data-chatpdf-owned';
  const ROLE_SELECTOR = '[data-message-author-role="assistant"], [data-message-author-role="user"]';
  const USER_SELECTOR = '[data-message-author-role="user"], [data-role="user"], [data-testid="user-message"], [class*="UserMessage"]';
  const ASSISTANT_SELECTOR = '[data-message-author-role="assistant"], [data-role="assistant"], [data-testid="assistant-message"]';
  // ChatGPT changes its HTML frequently. Try semantic markers first, then
  // conversation wrappers, and finally the rendered answer content.
  const TURN_SELECTOR = [
    'article[data-testid^="conversation-turn"]',
    '[data-testid^="conversation-turn-"]',
    '[data-testid="conversation-turn"]',
    'main article'
  ].join(', ');
  const CONTENT_SELECTOR = [
    '[data-testid="assistant-message"]',
    '[data-testid="message-content"]',
    '.markdown', '.prose',
    '[class*="markdown"]',
    '[class*="DilResponseRoot"]'
  ].join(', ');
  const DEFAULTS = { font: '10', margin: '15', spacing: 'compact', mode: 'compact' };
  let settings = { ...DEFAULTS };
  let selectedResponse = null;
  let observerTimer = null;
  let modal = null;
  let contextSelection = null;
  const responseButtons = new Map();

  chrome.storage.local.get(DEFAULTS, (stored) => {
    if (!chrome.runtime.lastError) settings = { ...DEFAULTS, ...stored };
  });

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function isOwned(node) {
    return !!node?.closest?.(`[${OWN}], #chatpdf-print-root`);
  }

  function hasContent(node) {
    // Our own controls and ChatGPT's action bars are not message content. This
    // also prevents an empty turn from surviving only because it has a button.
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode;
      if (text.data.trim() && !text.parentElement?.closest(`button,script,style,nav,[${OWN}]`)) return true;
    }
    return [...node.querySelectorAll('img,canvas,svg,math')].some(media =>
      !media.closest(`button,[aria-hidden="true"],[${OWN}]`));
  }

  function uniqueTopLevel(nodes) {
    const unique = [...new Set(nodes)].filter(node => node?.isConnected && !isOwned(node) &&
      !node.closest('header, nav, aside, footer, form, [contenteditable="true"], [role="dialog"], [hidden], [aria-hidden="true"]') && hasContent(node));
    // Keep a complete message, including all its DIL/markdown sections.
    const outermost = unique.filter(node => !unique.some(other => other !== node && other.contains(node)));
    // Preserve the reading order when different selector families are combined.
    return outermost.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : pos & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
    });
  }

  function containsUser(node) {
    return !!(node.closest(USER_SELECTOR) || node.querySelector(USER_SELECTOR));
  }

  function findRoles() {
    const detected = uniqueTopLevel([...document.querySelectorAll(ASSISTANT_SELECTOR)]
      .filter(node => !node.closest(USER_SELECTOR)));
    const overlaps = node => detected.some(other => other.contains(node) || node.contains(other));
    // Filter each content candidate BEFORE collapsing enclosing wrappers. A
    // shared turn/message-id can contain both the question and the answer, or
    // several messages. Its user marker must not suppress its answer children.
    const rendered = uniqueTopLevel([...document.querySelectorAll(CONTENT_SELECTOR)]
      .filter(node => !containsUser(node) && !overlaps(node)));
    const groups = new Map();
    for (const node of rendered) {
      let boundary = node.closest(`[data-message-id], ${TURN_SELECTOR}`);
      if (boundary && (containsUser(boundary) || overlaps(boundary))) {
        // Stay within the answer's branch of a shared container.
        let branch = node;
        while (branch.parentElement !== boundary && branch.parentElement &&
            !containsUser(branch.parentElement) && !overlaps(branch.parentElement)) {
          branch = branch.parentElement;
        }
        boundary = branch;
      }
      const key = boundary || node;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(node);
    }
    for (const nodes of groups.values()) {
      let content = nodes[0];
      while (!nodes.every(node => content.contains(node))) content = content.parentElement;
      detected.push(content);
    }
    // Plain responses without markdown/DIL still work when a message/turn
    // marker is present. Never use a container that includes a user question.
    const fallback = uniqueTopLevel([...document.querySelectorAll(`[data-message-id], ${TURN_SELECTOR}`)]
      .filter(node => !containsUser(node) && !overlaps(node)));
    detected.push(...fallback);
    return uniqueTopLevel(detected);
  }

  function isAssistantTurn(node) {
    const role = node.closest(ROLE_SELECTOR)?.getAttribute('data-message-author-role');
    if (role) return role === 'assistant';
    if (node.matches(USER_SELECTOR) || node.closest(USER_SELECTOR)) return false;
    if (node.matches('[class*="DilResponseRoot"]')) return true;
    if (node.querySelector('[data-message-author-role="assistant"]')) return true;
    if (node.querySelector('[data-message-author-role="user"]')) return false;
    if (node.querySelector(USER_SELECTOR)) return false;
    const marker = `${node.getAttribute('data-testid') || ''} ${node.getAttribute('data-role') || ''}`.toLowerCase();
    if (marker.includes('assistant')) return true;
    if (marker.includes('user')) return false;
    // A markdown/prose answer is a strong signal for an assistant turn.
    if (node.matches('.markdown, .prose, [data-testid="assistant-message"]') ||
        node.querySelector('.markdown, .prose, [data-testid="assistant-message"]')) return true;
    // In uncertain cases allow manual export rather than hide the button.
    return true;
  }

  function makeButton(text, className, onClick) {
    const button = el('button', className, text);
    button.type = 'button';
    button.setAttribute(OWN, '');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  function assistantTargets() {
    return findRoles().filter(isAssistantTurn);
  }

  function identifyResponse(node) {
    const turn = node.closest(TURN_SELECTOR);
    const messages = node.querySelectorAll('[data-message-id]');
    const nearestMessage = node.closest('[data-message-id]');
    const message = nearestMessage && !containsUser(nearestMessage) ? nearestMessage
      : (messages.length === 1 && !containsUser(messages[0]) ? messages[0] : null);
    const testId = turn?.getAttribute('data-testid');
    return {
      node, turn,
      page: location.origin + location.pathname + location.search,
      messageId: message?.getAttribute('data-message-id') || null,
      turnId: testId && testId !== 'conversation-turn' ? testId : turn?.id || null
    };
  }

  function resolveResponse(selection) {
    if (!selection || selection.page !== location.origin + location.pathname + location.search) return null;
    const candidates = assistantTargets().map(identifyResponse);
    // Prefer the same live node when its identity has not changed. Shared
    // turn IDs are not necessarily unique across rendered answer branches.
    const live = candidates.find(candidate => candidate.node === selection.node &&
      candidate.messageId === selection.messageId && candidate.turnId === selection.turnId);
    if (live) return live.node;
    let matches;
    if (selection.messageId) {
      matches = candidates.filter(candidate => candidate.messageId === selection.messageId);
    } else if (selection.turnId) {
      matches = candidates.filter(candidate => candidate.turnId === selection.turnId);
    } else if (candidates.some(candidate => candidate.node === selection.node)) {
      return selection.node;
    } else {
      matches = selection.turn?.isConnected
        ? candidates.filter(candidate => candidate.turn === selection.turn) : [];
    }
    // Never silently substitute another response if the selected one vanished.
    return matches.length === 1 ? matches[0].node : null;
  }

  function addPerResponseButtons() {
    const targets = assistantTargets();
    const active = new Set(targets);
    for (const [role, button] of responseButtons) {
      if (!active.has(role) || !button.isConnected) {
        button.remove();
        responseButtons.delete(role);
      }
    }
    // React may clone/move a control along with a subtree; cloned buttons have
    // no event listeners. Remove them before adding our tracked controls.
    const tracked = new Set(responseButtons.values());
    document.querySelectorAll(`.chatpdf-inline-button[${OWN}]`).forEach(button => {
      if (!tracked.has(button)) button.remove();
    });
    targets.forEach((role) => {
      // Put our control just AFTER the rendered response. Inserting INSIDE the
      // React/DIL subtree can disrupt layout and be removed on a rerender.
      const existing = responseButtons.get(role);
      if (existing) {
        if (role.nextElementSibling !== existing) role.insertAdjacentElement('afterend', existing);
        return;
      }
      const button = makeButton('Esporta PDF', 'chatpdf-inline-button', () => openModal(role));
      button.title = 'Esporta soltanto questa risposta in PDF';
      button.setAttribute('aria-label', 'Esporta questa risposta in PDF');
      role.insertAdjacentElement('afterend', button);
      responseButtons.set(role, button);
    });
  }

  function syncButtons() {
    try {
      addPerResponseButtons();
    } finally {
      // Discard just the synchronous mutations caused by this reconciliation.
      // External removals must remain observable, including removal of OWN nodes.
      observer.takeRecords();
    }
  }

  function createSetting(labelText, control) {
    const row = el('label', 'chatpdf-setting');
    row.appendChild(el('span', '', labelText));
    row.appendChild(control);
    return row;
  }

  function selectControl(options, selected) {
    const select = el('select', 'chatpdf-select');
    for (const [value, label] of options) {
      const option = el('option', '', label);
      option.value = value;
      select.appendChild(option);
    }
    select.value = selected;
    return select;
  }

  function openModal(role, snapshot = null) {
    closeModal();
    selectedResponse = snapshot ? { snapshot } : identifyResponse(role);

    modal = el('div', 'chatpdf-modal-backdrop');
    modal.setAttribute(OWN, '');
    modal.setAttribute('role', 'presentation');
    const dialog = el('div', 'chatpdf-modal');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Esportazione PDF');

    const header = el('div', 'chatpdf-modal-header');
    header.appendChild(el('h2', '', snapshot ? 'Esporta la selezione' : 'Esporta questa risposta'));
    const close = makeButton('×', 'chatpdf-close', closeModal);
    close.setAttribute('aria-label', 'Chiudi');
    header.appendChild(close);
    dialog.appendChild(header);
    dialog.appendChild(el('p', 'chatpdf-modal-intro', 'PDF A4 verticale, una colonna. La stampa resta sul tuo computer.'));

    const mode = selectControl([
      ['compact', 'Appunti compatti'],
      ['faithful', 'Più fedele a ChatGPT']
    ], settings.mode);
    const font = selectControl([
      ['9', '9 pt'], ['9.5', '9,5 pt'], ['10', '10 pt'],
      ['10.5', '10,5 pt'], ['11', '11 pt'], ['12', '12 pt']
    ], settings.font);
    const margin = selectControl([
      ['10', '10 mm'], ['12', '12 mm'], ['15', '15 mm'],
      ['18', '18 mm'], ['20', '20 mm']
    ], settings.margin);
    const spacing = selectControl([
      ['compact', 'Compatta'], ['normal', 'Normale'], ['wide', 'Ampia']
    ], settings.spacing);

    dialog.appendChild(createSetting('Modalità', mode));
    dialog.appendChild(createSetting('Dimensione del testo', font));
    dialog.appendChild(createSetting('Margini A4', margin));
    dialog.appendChild(createSetting('Spaziatura', spacing));

    const note = el('p', 'chatpdf-modal-note', (snapshot ? 'Verrà esportato solo il contenuto selezionato. ' : '') +
      'Si aprirà una scheda di anteprima. Quando il documento è pronto, premi «Stampa / Salva PDF» e scegli «Salva come PDF».');
    dialog.appendChild(note);
    const actions = el('div', 'chatpdf-modal-actions');
    actions.appendChild(makeButton('Annulla', 'chatpdf-cancel', closeModal));
    actions.appendChild(makeButton('Anteprima / Salva PDF', 'chatpdf-primary', () => {
      settings = { mode: mode.value, font: font.value, margin: margin.value, spacing: spacing.value };
      chrome.storage.local.set(settings);
      const roleToPrint = selectedResponse;
      closeModal();
      startPrint(roleToPrint);
    }));
    dialog.appendChild(actions);
    modal.appendChild(dialog);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    document.body.appendChild(modal);
    document.addEventListener('keydown', onEscape, true);
    close.focus();
  }

  function onEscape(event) {
    if (event.key === 'Escape') closeModal();
  }

  function closeModal() {
    if (modal) modal.remove();
    modal = null;
    document.removeEventListener('keydown', onEscape, true);
  }

  function startPrint(selection) {
    const current = selection?.snapshot || resolveResponse(selection);
    if (!current) {
      alert('La risposta selezionata non è più disponibile. Premi Esporta PDF sulla risposta che vuoi salvare.');
      return;
    }
    let mount;
    if (selection.snapshot) {
      // Attach privately while cloning so page CSS can still resolve SVG styles.
      mount = el('div');
      mount.setAttribute(OWN, '');
      mount.hidden = true;
      mount.appendChild(current);
      document.body.appendChild(mount);
    }
    try {
      const job = ChatPDFPrint.open({
        scope: 'single', settings,
        title: document.title.replace(/\s*[-–|]\s*ChatGPT\s*$/, "") || "Appunti ChatGPT",
        roles: [{ node: current, kind: 'assistant' }]
      });
      Promise.resolve(job?.ready).finally(() => mount?.remove());
    } catch (error) {
      mount?.remove();
      throw error;
    }
  }

  function captureSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0).cloneRange();
    const start = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
    const end = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
    if (isOwned(start) || isOwned(end) || start?.closest('input,textarea,[contenteditable="true"]')) return null;
    // Selecting a glyph inside an equation must not cut its KaTeX/MathJax tree.
    const mathSelector = '.katex-display, .katex, mjx-container, math';
    const startMath = start?.closest(mathSelector);
    const endMath = end?.closest(mathSelector);
    if (startMath) range.setStartBefore(startMath.closest('.katex-display') || startMath);
    if (endMath) range.setEndAfter(endMath.closest('.katex-display') || endMath);
    const snapshot = el('div', 'chatpdf-selected-content');
    snapshot.appendChild(range.cloneContents());
    snapshot.querySelectorAll(`[${OWN}],button,input,textarea,script,style`).forEach(node => node.remove());
    return hasContent(snapshot) ? snapshot : null;
  }

  document.addEventListener('contextmenu', () => {
    contextSelection = captureSelection();
  }, true);
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'chatpdf-export-selection') return;
    const snapshot = contextSelection || captureSelection();
    contextSelection = null;
    if (snapshot) openModal(null, snapshot);
    else alert('Seleziona il testo della risposta, poi usa il tasto destro e scegli Esporta selezione in PDF.');
  });

  function scheduleSync() {
    // A throttle, not a trailing debounce: continuous token updates must not
    // postpone button insertion until the response stops streaming.
    if (observerTimer !== null) return;
    observerTimer = setTimeout(() => {
      observerTimer = null;
      syncButtons();
    }, 200);
  }

  const observer = new MutationObserver((records) => {
    if (records.some(record => {
      const target = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
      if (isOwned(target)) return false;
      if (record.type !== 'childList') return true;
      return record.removedNodes.length || [...record.addedNodes].some(node => !isOwned(node));
    })) scheduleSync();
  });
  observer.observe(document.documentElement, {
    childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ['data-message-author-role', 'data-message-id', 'data-testid', 'data-role', 'class', 'hidden', 'aria-hidden']
  });
  window.addEventListener('pageshow', scheduleSync);
  window.addEventListener('focus', scheduleSync);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleSync();
  });
  syncButtons();
})();
