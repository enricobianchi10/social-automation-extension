let oldPostNumber = 0;

document.getElementById("getPost").addEventListener("click", async () => {
    let storage = await chrome.storage.local.get(null);
    oldPostNumber = Object.keys(storage).length;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({action: "getPost", tabId: tab.id});
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

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  if(url.includes("instagram.com/p")){
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
    switch (message.action){
        case "finishedScrape":
            const messageContainer = document.getElementById("messageContainer");
            const statusContainer = document.getElementById("statusContainer");
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
            statusContainer.appendChild(statusTitle);
           // statusContainer.appendChild(statusDiv);
    }
})