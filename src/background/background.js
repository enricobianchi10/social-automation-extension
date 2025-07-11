//riceve l'evento emesso dal pulsante del popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case 'getPost':
            console.log("Ricevuta richiesta di ottenere dati del post");
            chrome.tabs.sendMessage(message.tabId, {action: "scrapePost"}); 
            break;
        case 'savePost':
            console.log("Ricevuta richiesta di salvare il post");
            chrome.tabs.sendMessage(sender.tab.id, { action: "savePost", post: message.post });
            break;
        case 'finishedScrape':
            console.log("Ricevuta notifica di fine scraping");
            chrome.runtime.sendMessage({action: "finishedScrape", lastPost: message.lastPost});
            break;
        case 'showError':
            console.log("Ricevuta notifica di mostrare gli errori");
            chrome.runtime.sendMessage({action: "showError", error: message.error});
            break;
    }
})