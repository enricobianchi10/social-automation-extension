let social = "instagram";
let currentDownloadId = null;
let urlBlob = null;
let instaTabId = null;

// Utility DOM
function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function setText(el, text) {
  el.textContent = text;
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function showStatus(title, message = "") {
  const statusContainer = document.getElementById("statusContainer");
  clearChildren(statusContainer);
  const titleEl = document.createElement("h2");
  setText(titleEl, title);
  statusContainer.appendChild(titleEl);
  if (message) {
    const msgEl = document.createElement("p");
    msgEl.className = "card-text";
    setText(msgEl, message);
    statusContainer.appendChild(msgEl);
  }
  show(statusContainer);
}

function showError(message, url = null) {
  const errorContainer = document.getElementById("errorContainer");
  clearChildren(errorContainer);
  const titleEl = document.createElement("h2");
  setText(titleEl, `⚠️ ${message}`); 
  errorContainer.appendChild(titleEl);
  if (url) {
    const linkEl = document.createElement("a");
    linkEl.href = url;
    setText(linkEl, "Clicca qui per tornare all'ultimo post salvato.");
    linkEl.target = "_blank";
    errorContainer.appendChild(linkEl);
  }
  show(errorContainer);
}

function showParsingErrors(errors) {
  const errorContainer = document.getElementById("errorContainer");
  clearChildren(errorContainer);
  const titleEl = document.createElement("h2");
  setText(titleEl, "⚠️ Impossibile avviare la raccolta dati"); 
  errorContainer.appendChild(titleEl);

  const subtitleEl = document.createElement("p");
  subtitleEl.className = "card-text";
  setText(subtitleEl, "Il layout della pagina è cambiato (oppure la connessione non ha permesso di caricare gli elementi necessari) e non possiamo procedere. I seguenti selettori sono falliti:");
  errorContainer.appendChild(subtitleEl);

  const errorsList = document.createElement("ul");
  for (const err of errors) {
    const liErr = document.createElement("li");
    if (err.selector) {
      setText(liErr, `${err.message}. (XPath: ${err.selector})`);
    } else {
      setText(liErr, err.message);
    }
    errorsList.appendChild(liErr);
  }
  errorContainer.appendChild(errorsList);
  show(errorContainer);
}

document.getElementById("getPost").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "getPost", tabId: instaTabId, social: social });

  hide(document.getElementById("messageContainer"));
  hide(document.getElementById("downloadContainer"));
  hide(document.getElementById("publishContainer"));
  hide(document.getElementById("errorContainer"));

  showStatus("⏳ Raccolta dati in corso...", "Attendi che la raccolta dei dati venga completata senza interagire con la pagina.");
});

document.getElementById("publishComment").addEventListener("click", async () => {
  chrome.runtime.sendMessage({ action: "publishComment", tabId: instaTabId, social: social });

  hide(document.getElementById("publishContainer"));
  hide(document.getElementById("downloadContainer"));
  hide(document.getElementById("messageContainer"));
  hide(document.getElementById("errorContainer"));

  showStatus("⏳ Inserimento delle risposte in corso...", "Attendi che le risposte vengano pubblicate senza interagire con la pagina.");
});

document.getElementById("downloadData").addEventListener("click", async () => {
  hide(document.getElementById("downloadContainer"));
  hide(document.getElementById("errorContainer"));

  try {
    await downloadData();
  } catch (err) {
    showError("Errore nel download: " + err.message);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const result = await chrome.storage.local.get("status");
  const status = result.status;
  if (status === "raccoltaInCorso") {
    showStatus("⏳ Raccolta dati in corso...", "Attendi che la raccolta dei dati venga completata senza interagire con la pagina.");
  } else if (status === "pubblicazioneInCorso") {
    showStatus("⏳ Inserimento delle risposte in corso...", "Attendi che le risposte vengano pubblicate senza interagire con la pagina.");
  } else {
    await chrome.storage.local.set({ status: "finished" });
    const messageContainer = document.getElementById("messageContainer");
    const getPostButton = document.getElementById("getPost");

    const tabs = await chrome.tabs.query({ url: "*://www.instagram.com/*" });
    const urlToExclude = "https://www.instagram.com/account_prova1212/";

    const filteredTabs = tabs.filter(tab => tab.url !== urlToExclude);

    if (filteredTabs.length === 0) {
      setText(messageContainer.querySelector('p'), "Per iniziare, apri una pagina di Instagram e accedi al tuo profilo.");
      show(messageContainer);
      hide(getPostButton);
      return;
    }

    // Verifica cookie (autenticazione)
    instaTabId = await checkCookies(filteredTabs);

    if (instaTabId) {
      showStatus("🔍 Analisi in corso...", "Stiamo analizzando il layout di Instagram. Per favore, attendi il termine del caricamento senza interagire con la pagina.");
      chrome.runtime.sendMessage({ action: "validatePath", social: social, tabId: instaTabId });
    } else {
      setText(messageContainer.querySelector('p'), "Per procedere, effettua prima il login a Instagram. Una volta loggato, l'estensione si abiliterà automaticamente.");
      show(messageContainer);
      hide(getPostButton);
    }
  }
});

chrome.runtime.onMessage.addListener(async (message) => {
  const messageContainer = document.getElementById("messageContainer");
  const publishContainer = document.getElementById("publishContainer");
  const downloadContainer = document.getElementById("downloadContainer");

  switch (message.action) {
    case "finishedScrape":
      showStatus("✅ Raccolta dati completata con successo!");
      const link = document.createElement("a");
      link.href = message.lastPost;
      link.target = "_blank";
      link.textContent = "Clicca qui per visualizzare l'ultimo post salvato.";
      document.getElementById("statusContainer").appendChild(link);
      show(downloadContainer);
      if (message.diff) {
        setText(messageContainer.querySelector('h2'), "Nuovi dati rilevati");
        setText(messageContainer.querySelector('p'), "Sono stati rilevati nuovi commenti dall'ultima raccolta dati. Puoi scegliere di pubblicare le risposte automatiche.");
        show(messageContainer);
        show(publishContainer);
      } else {
        setText(messageContainer.querySelector('h2'), "Raccolta completata");
        setText(messageContainer.querySelector('p'), "Non sono stati rilevati nuovi dati rispetto all'ultima raccolta.");
        show(messageContainer);
      }
      break;

    case "showError":
      hide(document.getElementById("statusContainer"));
      showError(message.error.message, message.error.url);
      break;

    case "finishedPublish":
      showStatus("✅ Pubblicazione dei commenti completata con successo!");
      setText(messageContainer.querySelector('h2'), "Operazione completata");
      setText(messageContainer.querySelector('p'), "Le risposte ai commenti sono state pubblicate con successo.");
      show(messageContainer);
      hide(downloadContainer);
      break;

    case "finishedValidation":
      errors = message.errors;
      if (errors.length === 0) {
        hide(document.getElementById("statusContainer"));
        setText(messageContainer.querySelector('h2'), "🎉 Pronto a iniziare");
        setText(messageContainer.querySelector('p'), "La verifica del layout è andata a buon fine. Premi il pulsante per avviare la raccolta dati.");
        show(messageContainer);
      } else {
        hide(document.getElementById("statusContainer"));
        showParsingErrors(errors);
      }
      break;
  }
});

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.id !== currentDownloadId) return;

  const downloadContainer = document.getElementById("downloadContainer");

  if (delta.state?.current === "complete") {
    showStatus("✅ Download terminato con successo!");
    show(downloadContainer);
    cleanupDownload();
  }

  if (delta.state?.current === "interrupted") {
    show(downloadContainer);
    showError("Download interrotto! Errore: " + delta.error);
    cleanupDownload();
  }
});

function cleanupDownload() {
  if (urlBlob) URL.revokeObjectURL(urlBlob);
  urlBlob = null;
  currentDownloadId = null;
}

async function downloadData() {
  const { postList } = await chrome.storage.local.get("postList");
  const blob = new Blob([JSON.stringify(postList, null, 2)], { type: "application/json" });
  urlBlob = URL.createObjectURL(blob);
  currentDownloadId = await chrome.downloads.download({
    url: urlBlob,
    filename: "dati_post.json",
    saveAs: true,
  });
}

async function checkCookies(tabs) {
  const nameCookies = ["sessionid", "ds_user_id"];

  for (const tab of tabs) {
    let validCookies = 0;

    for (const name of nameCookies) {
      const cookie = await chrome.cookies.get({ url: tab.url, name });
      if (cookie) validCookies++;
    }

    if (validCookies === nameCookies.length) return tab.id;
  }

  return false;
}