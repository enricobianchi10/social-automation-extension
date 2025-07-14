chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.action){
        case "savePost":
            console.log("Ricevuta richiesta di salvataggio in storage da background");
            const save = async () => {
                await PostAdapter.save(message.post);
                const items = await chrome.storage.local.get(null);
                console.log('Contenuto di chrome.storage.local:', items);
                sendResponse({status: "saved"});
            }
            save();
            return true;
    }
})
