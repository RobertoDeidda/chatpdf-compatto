const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const listeners = {};
const menus = [];
const sent = [];
const context = { chrome: {
  runtime: {
    onInstalled: { addListener: fn => { listeners.install = fn; } },
    onStartup: { addListener: fn => { listeners.startup = fn; } }
  },
  contextMenus: {
    removeAll: callback => { menus.length = 0; callback(); },
    create: menu => menus.push(menu),
    onClicked: { addListener: fn => { listeners.click = fn; } }
  },
  tabs: { sendMessage: (...args) => { sent.push(args); return Promise.resolve(); } }
}, console };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../extension/background.js'), 'utf8'), context);
listeners.install();
listeners.startup();
assert.equal(menus.length, 1);
assert.equal(menus[0].title, 'Esporta selezione in PDF');
assert.equal(menus[0].contexts.join(','), 'selection');
assert.equal(menus[0].documentUrlPatterns.join(','), 'https://chatgpt.com/*,https://chat.openai.com/*');
listeners.click({ menuItemId: 'other' }, { id: 42 });
assert.equal(sent.length, 0);
listeners.click({ menuItemId: 'chatpdf-export-selection', frameId: 0 }, { id: 42 });
assert.equal(sent[0][0], 42);
assert.equal(sent[0][1].type, 'chatpdf-export-selection');
assert.equal(sent[0][2].frameId, 0);
console.log('PASS Context menu registration, scope and message routing');
