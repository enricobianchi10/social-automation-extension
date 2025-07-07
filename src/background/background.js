//riceve l'evento emesso dal pulsante del popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case 'getPost':
            console.log("Ricevuta richiesta di ottenere dati del post");
            chrome.tabs.sendMessage(message.tabId, {action: "scrapePost"}); 
    }
})