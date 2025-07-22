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
    setText(msgEl, message);
    statusContainer.appendChild(msgEl);
  }
  show(statusContainer);
}

function showError(message, url = null) {
  const errorContainer = document.getElementById("errorContainer");
  clearChildren(errorContainer);
  const titleEl = document.createElement("h2");
  setText(titleEl, message);
  errorContainer.appendChild(titleEl);
  if (url) {
    const linkEl = document.createElement("a");
    linkEl.href = url;
    setText(linkEl, "Clicca qui per raggiungere l'ultimo post salvato!");
    linkEl.target = "_blank";
    errorContainer.appendChild(linkEl);
  }
  show(errorContainer);
}

document.getElementById("getPost").addEventListener("click", async () => {
  chrome.runtime.sendMessage({ action: "getPost", tabId: instaTabId, social: social });

  hide(document.getElementById("getPost"));
  hide(document.getElementById("messageContainer"));
  hide(document.getElementById("downloadContainer"));
  hide(document.getElementById("publishContainer"));
  hide(document.getElementById("pubblicaTitle"));

  showStatus("Raccolta dati in corso...", "Attendi il termine della raccolta dei dati senza interagire con la pagina");
});

document.getElementById("publishComment").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "publishComment", tabId: instaTabId, social: social });

  hide(document.getElementById("publishContainer"));
  hide(document.getElementById("raccoltaTitle"));
  hide(document.getElementById("getPost"));
  hide(document.getElementById("downloadContainer"));
  hide(document.getElementById("messageContainer"));

  showStatus("Inserimento del commento in corso...", "Attendi il termine dell'inserimento del commento senza interagire con la pagina");
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

document.getElementById("fileInput").addEventListener("change", async () => {
  const file = document.getElementById("fileInput").files[0];
  const publishContainer = document.getElementById("publishContainer");

  publishContainer.querySelectorAll("p").forEach(p => p.remove());

  const statusFile = document.createElement("p");
  if (!file) {
    setText(statusFile, "Nessun file selezionato.");
    publishContainer.appendChild(statusFile);
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    validateData(data);
    setText(statusFile, "File valido: " + data.length + " commenti da pubblicare");
    show(document.getElementById("publishComment"));
    await chrome.storage.local.set({ commentToPublish: data });
  } catch (err) {
    setText(statusFile, "Il file JSON selezionato non è nel formato corretto");
  }

  publishContainer.appendChild(statusFile);
});

document.addEventListener("DOMContentLoaded", async () => {
  const messageContainer = document.getElementById("messageContainer");
  const getPostButton = document.getElementById("getPost");

  const tabs = await chrome.tabs.query({ url: "*://www.instagram.com/*" });

  if (tabs.length === 0) {
    setText(messageContainer, "Apri una pagina di Instagram ed effettua il login del profilo per abilitare la raccolta dati");
    show(messageContainer);
    hide(getPostButton);
    return;
  }

  // Verifica cookie (autenticazione)
  instaTabId = await checkCookies(tabs);

  if (instaTabId) {
    setText(messageContainer, "Fai click sul pulsante per iniziare la raccolta dati dei post");
    show(messageContainer, getPostButton);
  } else {
    setText(messageContainer, "Effettua prima il login del profilo per abilitare la raccolta dati");
    show(messageContainer);
    hide(getPostButton);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  const messageContainer = document.getElementById("messageContainer");
  const publishContainer = document.getElementById("publishContainer");
  const downloadContainer = document.getElementById("downloadContainer");
  const getPostBtn = document.getElementById("getPost");

  switch (message.action) {
    case "finishedScrape":
      showStatus("Raccolta dati dai post terminata con successo");
      const link = document.createElement("a");
      link.href = message.lastPost;
      link.target = "_blank";
      link.textContent = "Clicca qui per raggiungere l'ultimo post salvato!";
      document.getElementById("statusContainer").appendChild(link);
      show(downloadContainer);
      show(messageContainer);
      show(getPostBtn);
      show(publishContainer);
      show(document.getElementById("pubblicaTitle"));
      break;

    case "showError":
      showError(message.error.message, message.error.url);
      break;

    case "finishedPublish":
      showStatus("Pubblicazione dei commenti ai post terminata con successo");
      show(messageContainer);
      show(getPostBtn);
      show(document.getElementById("raccoltaTitle"));
      hide(downloadContainer);
      break;
  }
});

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.id !== currentDownloadId) return;

  const downloadContainer = document.getElementById("downloadContainer");

  if (delta.state?.current === "complete") {
    showStatus("Download terminato con successo!");
    show(downloadContainer);
    cleanupDownload();
  }

  if (delta.state?.current === "interrupted") {
    show(downloadContainer);
    showError("Download interrotto!", "Errore: " + delta.error);
    cleanupDownload();
  }
});

function cleanupDownload() {
  if (urlBlob) URL.revokeObjectURL(urlBlob);
  urlBlob = null;
  currentDownloadId = null;
}

function validateData(data) {
  if (!Array.isArray(data)) throw new Error("Il file JSON deve contenere un array di oggetti.");

  data.forEach((item, i) => {
    const index = i + 1;
    if (typeof item !== "object" || item === null) throw new Error(`Elemento ${index} non è un oggetto valido.`);

    const requiredFields = ["url", "author", "text", "replies"];
    requiredFields.forEach((field) => {
      if (!(field in item)) throw new Error(`Elemento ${index} manca il campo '${field}'.`);
      if (typeof item[field] !== "string" || item[field].trim() === "") {
        throw new Error(`Il campo '${field}' in elemento ${index} deve essere una stringa non vuota.`);
      }
    });

    try {
      new URL(item.url);
    } catch {
      throw new Error(`Il campo 'url' in elemento ${index} non è un URL valido.`);
    }
  });
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
