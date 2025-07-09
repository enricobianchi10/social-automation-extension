chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch(message.action){
        case "savePost":
            console.log("Ricevuta richiesta di salvataggio in storage da background");
            await PostAdapter.save(message.post);
            const items = await chrome.storage.local.get(null);
            console.log('Contenuto di chrome.storage.local:', items);
            break;
    }
})

//funziona tutto, bisogna trovare il modo di far identificare il post con un id univoco che però dovrà sempre essere quello anche dopo
//aggiunta di ulteriori post