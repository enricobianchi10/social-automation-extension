//riceve l'evento emesso dal pulsante del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action){
        case 'getPost':
            console.log("Ricevuta richiesta di ottenere dati del post");
            chrome.tabs.sendMessage(message.tabId, {action: "scrapePost", social: message.social}); 
            break;
        case 'savePost':
            console.log("Ricevuta richiesta di salvare il post");
            chrome.tabs.sendMessage(sender.tab.id, { action: "savePost", post: message.post }, (response) => {
                sendResponse(response);
            });
            return true;
        case 'finishedScrape':
            console.log("Ricevuta notifica di fine scraping");
            chrome.runtime.sendMessage({action: "finishedScrape", lastPost: message.lastPost});
            break;
        case 'showError':
            console.log("Ricevuta notifica di mostrare gli errori");
            chrome.runtime.sendMessage({action: "showError", error: message.error});
            break;
        case 'postData':
            console.log("Ricevuta richiesta di elaborazione dei dati");
            const sendData = async () => {
                let result = await chrome.storage.local.get("postList");
                let postData = result.postList;
                fetch('https://webhook.site/10a41ee8-38a2-4384-bedb-74fbb07e9cbc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                })
                .then(res => res.text())
                .then(data => {
                    console.log('Risposta dal server:', data);
                    sendResponse({data: data });
                })
                .catch(err => {
                    console.log('Errore fetch:', err);
                    sendResponse({data: err });
                });
            }
            sendData();
            return true;
    }
})