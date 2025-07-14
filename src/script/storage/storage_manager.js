chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.action){
        case "savePost":
            console.log("Ricevuta richiesta di salvataggio in storage da background");
            const save = async () => {
                await PostAdapter.save(message.post);
                sendResponse({status: "saved"});
            }
            save();
            return true;
    }
})
