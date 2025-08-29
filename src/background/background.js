import diff from 'https://esm.sh/deep-diff';

let oldPostList;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

//riceve eventi emessi che non richiedono esecuzione di funzioni asincrone
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action){
        case 'savePost':
            console.log("Ricevuta richiesta di salvare il post");
            chrome.tabs.sendMessage(sender.tab.id, { action: "savePost", post: message.post }, (response) => {
                sendResponse(response);
            });
            return true;
        case 'validatePath':
            chrome.tabs.create(
              {
                url: 'https://www.instagram.com/account_prova1212/', // URL del profilo snapshot
                active: false,
              },
              (tab) => {
                const tabId = tab.id;

                const listener = (updatedTabId, changeInfo) => {
                  if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    console.log("Tab di verifica aperto.");
                    chrome.tabs.sendMessage(tabId, { action: "validatePath", social: message.social });
                  }
                };

                chrome.tabs.onUpdated.addListener(listener);
              }
            ); 
            break;;
        case 'finishedValidation':
            chrome.tabs.remove(sender.tab.id, () => {
              console.log("Tab di verifica chiuso.");
            });
            chrome.runtime.sendMessage({action: "finishedValidation", errors: message.errors});
            break;
    }
})

//riceve eventi e deve gestire asincronismo
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case 'getPost':
            console.log("Ricevuta richiesta di ottenere dati del post");
            await chrome.storage.local.set({status: "raccoltaInCorso"});
            try {
                oldPostList = await chrome.storage.local.get("postList");
            } catch (error) {
                await chrome.storage.local.set({status: "finished"});
                chrome.runtime.sendMessage({action: "showError", error: error});
                return;
            }
            chrome.tabs.sendMessage(message.tabId, {action: "scrapePost", social: message.social}); 
            break;
        case 'finishedScrape':
            console.log("Ricevuta notifica di fine scraping");
            await chrome.storage.local.set({status: "finished"});
            try {
                const newPostList = await chrome.storage.local.get("postList");
                const diff = getDiff(oldPostList, newPostList);
                let hasDiff = false;
                if(diff) {
                    await fetchPostData(diff);
                    hasDiff = true;
                }
                chrome.runtime.sendMessage({action: "finishedScrape", lastPost: message.lastPost, diff: hasDiff});
            } catch (error) {
                chrome.runtime.sendMessage({action: "showError", error: error});
                break;
            }
            break;
        case 'publishComment':
            console.log("Ricevuta richiesta di postare un commento");
            await chrome.storage.local.set({status: "pubblicazioneInCorso"});
            const replies = await fetchGetData();
            chrome.tabs.sendMessage(message.tabId, {action: "publishComment", social: message.social, replies: replies});
            break;
        case 'showError':
            console.log("Ricevuta notifica di mostrare gli errori");
            await chrome.storage.local.set({status: "finished"});
            chrome.runtime.sendMessage({action: "showError", error: message.error});
            break;
        case 'finishedPublish':
            console.log("Ricevuta notifica di fine pubblicazione commenti");
            await chrome.storage.local.set({status: "finished"});
            chrome.runtime.sendMessage({action: "finishedPublish"});
            break;
    }
})


async function fetchPostData(data){
    const response = await fetch('https://webhook.site/4433d8c6-8dfc-46f3-815a-8f5df33f21f6', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorText = await response.text(); // Prova a leggere il corpo dell'errore
        throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
    }
    const responseData = await response.text(); 
    return responseData; 
}

async function fetchGetData(){
    const response = await fetch('https://webhook.site/4433d8c6-8dfc-46f3-815a-8f5df33f21f6', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        const errorText = await response.text(); // Prova a leggere il corpo dell'errore
        throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
    }
    const responseData = await response.json(); 
    return responseData; 
}

function getDiff(oldList, newList){
    const differences = diff(oldList, newList, (path, key) => {
        if(key === "_src"){
            return true;
        }
        return undefined;
    });
    console.log("Differenza deepdiff:", JSON.stringify(differences, null, 2));
    const filteredDiff = differences ? differences.filter(d => d.kind !== "D") : []; //non considero variazioni nei dati se solo delete
    return filteredDiff;
}
