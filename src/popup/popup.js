let social = "instagram";
let currentDownloadId = null;
let urlBlob = null;
let instaTabId = null;

document.getElementById("getPost").addEventListener("click", async () => {
    //const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({action: "getPost", tabId: instaTabId, social: social});
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    messageContainer.style.display = 'none';
    document.getElementById("getPost").style.display = 'none';
    const statusContainer = document.getElementById("statusContainer");
    statusContainer.innerHTML = "";
    const statusTitle = document.createElement("h2");
    statusTitle.textContent = "Raccolta dati in corso...";
    const statusP = document.createElement("p");
    statusP.textContent = "Attendi il termine della raccolta dei dati senza interagire con la pagina";
    statusContainer.appendChild(statusTitle);
    statusContainer.appendChild(statusP);
    statusContainer.style.display = 'block';
    document.getElementById("publishContainer").style.display = 'none';
})

document.getElementById("publishComment").addEventListener("click", () => {
    //const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({action: "publishComment", tabId: instaTabId, social: social});
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    messageContainer.style.display = 'none';
    document.getElementById("publishContainer").style.display = 'none';
    const statusContainer = document.getElementById("statusContainer");
    statusContainer.innerHTML = "";
    const statusTitle = document.createElement("h2");
    statusTitle.textContent = "Inserimento del commento in corso...";
    const statusP = document.createElement("p");
    statusP.textContent = "Attendi il termine dell'inserimento del commento senza interagire con la pagina";
    statusContainer.appendChild(statusTitle);
    statusContainer.appendChild(statusP);
    statusContainer.style.display = 'block';
    document.getElementById("getPost").style.display = 'none';
})

document.getElementById("downloadData").addEventListener("click", async () => {
    // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const downloadContainer = document.getElementById("downloadContainer");
    const errorContainer = document.getElementById("errorContainer");
    downloadContainer.innerHTML = "";
    errorContainer.innerHTML = "";
    try {
      await downloadData();
    }
    catch (err) {
      const errorTitle = document.createElement("h2");
      errorTitle.textContent = "Errore nel download: " + err.message;
      errorContainer.appendChild(errorTitle);
      errorContainer.style.display = 'block';
    }
})

document.getElementById("fileInput").addEventListener("change", async () => {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const publishContainer = document.getElementById("publishContainer");
    const publishP = publishContainer.querySelectorAll("p");
    publishP.forEach(p => p.remove());
    const statusFile = document.createElement("p");
    if (!file) {
      statusFile.textContent = "Nessun file selezionato.";
      publishContainer.appendChild(statusFile);
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      validateData(data);
      document.getElementById("publishComment").style.display = 'block';
      await chrome.storage.local.set({ commentToPublish: data });
    }
    catch(err){
      statusFile.textContent = "Il file JSON selezionato non è nel formato corretto";
      publishContainer.appendChild(statusFile);
    }
})

document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await chrome.tabs.query({ url: "*://www.instagram.com/*"});
  console.log("Lunghezza tabs:" + tabs.length);
  if(tabs.length > 0){
    instaTabId = await checkCookies(tabs);
    if(instaTabId){
      const messageContainer = document.getElementById("messageContainer");
      messageContainer.innerHTML = "";
      const message = document.createElement("p");
      message.textContent = "Fai click sul pulsante per iniziare la raccolta dati dei post";
      messageContainer.appendChild(message);
      messageContainer.style.display = 'block';
    }
    else{
      const messageContainer = document.getElementById("messageContainer");
      messageContainer.innerHTML = "";
      const message = document.createElement("p");
      message.textContent = "Effettua prima il login del profilo per abilitare la raccolta dati";
      messageContainer.appendChild(message);
      messageContainer.style.display = 'block';
    }
  }
  else {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = "Apri una pagina di Instagram ed effettua il login del profilo per abilitare la raccolta dati";
    messageContainer.appendChild(message);
    messageContainer.style.display = 'block';
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const messageContainer = document.getElementById("messageContainer");
  const statusContainer = document.getElementById("statusContainer");
  const errorContainer = document.getElementById("errorContainer");
  let statusTitle;
  let statusLink;
  switch (message.action){
        case "finishedScrape":
            errorContainer.innerHTML = "";
            messageContainer.innerHTML = "";
            statusContainer.innerHTML = "";
            statusTitle = document.createElement("h2");
            statusTitle.textContent = "Raccolta dati dai post terminata con successo";
            statusLink = document.createElement("a");
            statusLink.href = message.lastPost;
            statusLink.textContent = "Clicca qui per raggiungere l'ultimo post salvato!";
            statusLink.target = "_blank";
            statusContainer.appendChild(statusTitle);
            statusContainer.appendChild(statusLink);
            document.getElementById("downloadContainer").style.display = 'block';
            statusContainer.style.display = 'block';
            messageContainer.style.display = 'none';
            document.getElementById("publishContainer").style.display = 'block';
            break;
        case "showError":
            errorContainer.innerHTML = "";
            const errorTitle = document.createElement("h2");
            errorTitle.textContent = message.error.message;
            const errorLink = document.createElement("a");
            errorLink.href = message.error.url;
            errorLink.textContent = "Clicca qui per raggiungere l'ultimo post salvato!";
            errorLink.target = "_blank";
            errorContainer.appendChild(errorTitle);
            errorContainer.appendChild(errorLink);
            errorContainer.style.display = 'block';
            messageContainer.style.display = 'none';
            break;
        case "finishedPublish":
            errorContainer.innerHTML = "";
            messageContainer.innerHTML = "";
            statusContainer.innerHTML = "";
            statusTitle = document.createElement("h2");
            statusTitle.textContent = "Pubblicazione dei commenti ai post terminata con successo";
            statusContainer.appendChild(statusTitle);
            statusContainer.style.display = 'block';
            messageContainer.style.display = 'none';
            document.getElementById("getPost").style.display = 'block';
            break;  
    }
})

chrome.downloads.onChanged.addListener((delta) => {
  
  const downloadContainer = document.getElementById("downloadContainer");
  const errorContainer = document.getElementById("errorContainer");
  downloadContainer.innerHTML = "";
  errorContainer.innerHTML = "";
  
  if (delta.id !== currentDownloadId) return;
  
  if (delta.state?.current === "complete"){
    const downloadTitle = document.createElement("h2");
    downloadTitle.textContent = "Download terminato con successo!";
    downloadContainer.appendChild(downloadTitle);
    downloadContainer.style.display = 'block';
    // Dopo il download, rilascia l'URL per liberare memoria
    URL.revokeObjectURL(urlBlob);
    urlBlob = null;
    currentDownloadId = null;
  }

  if(delta.state?.current === "interrupted"){
    const errorTitle = document.createElement("h2");
    errorTitle.textContent = "Download interrotto!";
    const errorP = document.createElement("p");
    errorP.textContent = "Errore:" + delta.error;
    errorContainer.appendChild(errorTitle);
    errorContainer.appendChild(errorP);
    errorContainer.style.display = 'block';
    // Dopo il download, rilascia l'URL per liberare memoria
    URL.revokeObjectURL(urlBlob);
    urlBlob = null;
    currentDownloadId = null;
  }
})

function validateData(data) {
  if (!Array.isArray(data)) {
    throw new Error("Il file JSON deve contenere un array di oggetti.");
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const index = i + 1;

    if (typeof item !== 'object' || item === null) {
      throw new Error(`Elemento ${index} non è un oggetto valido.`);
    }

    const requiredFields = ['url', 'author', 'text', 'replies'];
    for (const field of requiredFields) {
      if (!(field in item)) {
        throw new Error(`Elemento ${index} manca il campo '${field}'.`);
      }
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        throw new Error(`Il campo '${field}' in elemento ${index} deve essere una stringa non vuota.`);
      }
    }

    // Controllo URL valido (opzionale ma utile)
    try {
      new URL(item.url);
    } catch {
      throw new Error(`Il campo 'url' in elemento ${index} non è un URL valido.`);
    }
  }

  return true; // Tutto ok
}

async function downloadData() {
  const data = await chrome.storage.local.get("postList");
  const json_data = JSON.stringify(data, null, 2);
  const blob = new Blob([json_data], { type: "application/json" });
  urlBlob = URL.createObjectURL(blob);

  currentDownloadId = await chrome.downloads.download({
    url: urlBlob,
    filename: "dati_post.json",
    saveAs: true,
  });
}

async function checkCookies(tabs){
  
  const nameCookies = ["sessionid", "ds_user_id"];
  let validCookies = 0;
  
  for (const tab of tabs) {
    for (const name of nameCookies) {
      const cookie = await chrome.cookies.get({ url: tab.url, name: name });
      if (cookie) {
        console.log("La tab " + tab.url + " contiene il cookie " + cookie.name);
        validCookies += 1;
      }
    }
    console.log("Valore validCookies " + validCookies);
    if(validCookies === nameCookies.length){
      console.log("Trovata tab valida: " + tab.url + " " + tab.id);
      return tab.id;
    }
    else {
      validCookies = 0;
    }
  }
  return false;
}

