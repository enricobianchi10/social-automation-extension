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
})

document.getElementById("publishComment").addEventListener("click", () => {
    //const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({action: "publishComment", tabId: instaTabId, social: social});
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    messageContainer.style.display = 'none';
    document.getElementById("publishComment").style.display = 'none';
    const statusContainer = document.getElementById("statusContainer");
    statusContainer.innerHTML = "";
    const statusTitle = document.createElement("h2");
    statusTitle.textContent = "Inserimento del commento in corso...";
    const statusP = document.createElement("p");
    statusP.textContent = "Attendi il termine dell'inserimento del commento senza interagire con la pagina";
    statusContainer.appendChild(statusTitle);
    statusContainer.appendChild(statusP);
    statusContainer.style.display = 'block';
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
      document.getElementById("getPost").style.display = 'block';
    }
    else{
      const messageContainer = document.getElementById("messageContainer");
      messageContainer.innerHTML = "";
      const message = document.createElement("p");
      message.textContent = "Effettua prima il login del profilo per abilitare la raccolta dati";
      messageContainer.appendChild(message);
    }
  }
  else {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = "Apri una pagina di Instagram ed effettua il login del profilo per abilitare la raccolta dati";
    messageContainer.appendChild(message);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const messageContainer = document.getElementById("messageContainer");
  const statusContainer = document.getElementById("statusContainer");
  const errorContainer = document.getElementById("errorContainer");
  switch (message.action){
        case "finishedScrape":
            errorContainer.innerHTML = "";
            messageContainer.innerHTML = "";
            statusContainer.innerHTML = "";
            const statusTitle = document.createElement("h2");
            statusTitle.textContent = "Raccolta dati dai post terminata con successo";
            const statusLink = document.createElement("a");
            statusLink.href = message.lastPost;
            statusLink.textContent = "Clicca qui per raggiungere l'ultimo post salvato!";
            statusLink.target = "_blank";
            statusContainer.appendChild(statusTitle);
            statusContainer.appendChild(statusLink);
            document.getElementById("downloadContainer").style.display = 'block';
            statusContainer.style.display = 'block';
            messageContainer.style.display = 'none';
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
    }
})


async function downloadData() {
  const data = await chrome.storage.local.get(null);
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
    if(validCookies === 2){
      console.log("Trovata tab valida: " + tab.url + " " + tab.id);
      return tab.id;
    }
    else {
      validCookies = 0;
    }
  }
  return false;
}

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
    errorP.tectContent = "Errore:" + delta.error;
    errorContainer.appendChild(errorTitle);
    errorContainer.appendChild(errorP);
    errorContainer.style.display = 'block';
    // Dopo il download, rilascia l'URL per liberare memoria
    URL.revokeObjectURL(urlBlob);
    urlBlob = null;
    currentDownloadId = null;
  }
})



