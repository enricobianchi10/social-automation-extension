let oldPostNumber = 0;
let social = "";

document.getElementById("getPost").addEventListener("click", async () => {
    //let storage = await chrome.storage.local.get(null);
    //oldPostNumber = Object.keys(storage).length;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({action: "getPost", tabId: tab.id, social: social});
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    document.getElementById("getPost").style.display = 'none';
    const statusContainer = document.getElementById("statusContainer");
    statusContainer.innerHTML = "";
    const statusTitle = document.createElement("h2");
    statusTitle.textContent = "Raccolta dati in corso...";
    const statusP = document.createElement("p");
    statusP.textContent = "Attendi il termine della raccolta dei dati senza interagire con la pagina";
    statusContainer.appendChild(statusTitle);
    statusContainer.appendChild(statusP);
})

document.getElementById("downloadData").addEventListener("click", async () => {
    // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const downloadContainer = document.getElementById("downloadContainer");
    downloadContainer.innerHTML = "";
    try {
      await downloadData();
      const downloadTitle = document.createElement("h2");
      downloadTitle.textContent = "Download terminato con successo!";
      downloadContainer.appendChild(downloadTitle);
    }
    catch (err) {
      downloadContainer.style.display = "none";
      const errorContainer = document.getElementById("errorContainer");
      errorContainer.innerHTML = "";
      const errorTitle = document.createElement("h2");
      errorTitle.textContent = "Errore nel download: " + err.message;
      errorContainer.appendChild(errorTitle);
    }
})

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  if(url.includes("instagram.com/p") || url.includes("facebook.com/photo") || url.includes("facebook.com/photo.php")){
    if (url.includes("instagram.com/p")){
      social = "instagram";
    }
    else {
      social = "facebook";
    }
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = "Fai click sul pulsante per iniziare la raccolta dati dei post";
    messageContainer.appendChild(message);
    document.getElementById("getPost").style.display = 'block';
  }
  else {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = "Raggiungi la pagina del profilo e fai click sul primo post per abilitare la raccolta dati";
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
           /* const statusDiv = document.createElement("div");
            let new_storage = await chrome.storage.local.get(null);
            newPostNumber = Object.keys(new_storage).length;
            statusDiv.innerHTML = `
                <p>Numero di post raccolti prima: ${oldPostNumber}</p>
                <p>Nuovi post aggiunti: ${newPostNumber - oldPostNumber}</p>
                <p>Totale attuale: ${newPostNumber}</p> `; */
            const statusLink = document.createElement("a");
            statusLink.href = message.lastPost;
            statusLink.textContent = "Clicca qui per raggiungere l'ultimo post salvato!";
            statusLink.target = "_blank";
            statusContainer.appendChild(statusTitle);
            statusContainer.appendChild(statusLink);
            document.getElementById("downloadContainer").style.display = 'block';
            // statusContainer.appendChild(statusDiv);
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
            break;
    }
})


async function downloadData() {
  const data = await chrome.storage.local.get(null);
  const json_data = JSON.stringify(data, null, 2);
  const blob = new Blob([json_data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  await chrome.downloads.download({
    url: url,
    filename: "dati_post.json",
    saveAs: true,
  });

  // Dopo il download, rilascia l'URL per liberare memoria
  URL.revokeObjectURL(url);
}
