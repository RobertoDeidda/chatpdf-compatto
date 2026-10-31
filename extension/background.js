const MENU_ID = 'chatpdf-export-selection';

function installMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'Esporta selezione in PDF',
      contexts: ['selection'],
      documentUrlPatterns: ['https://chatgpt.com/*', 'https://chat.openai.com/*']
    });
  });
}

chrome.runtime.onInstalled.addListener(installMenu);
chrome.runtime.onStartup.addListener(installMenu);
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || tab?.id == null) return;
  chrome.tabs.sendMessage(tab.id, { type: MENU_ID }, { frameId: info.frameId || 0 }).catch(() => {
    // After an extension update, old tabs need a reload to receive the listener.
    console.warn('ChatPDF: ricarica la scheda ChatGPT per attivare Esporta selezione in PDF.');
  });
});
