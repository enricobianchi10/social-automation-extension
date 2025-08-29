chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.action){
        case "savePost":
            console.log("Ricevuta richiesta di salvataggio in storage da background");
            const storageService = new LocalStoragePostAdapter();
            const save = async () => {
                await storageService.save(message.post);
                sendResponse({status: "saved"});
            }
            save();
            return true;
    }
})
