chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch(message.action){
        case "validatePath":
            console.log("Ricevuta richiesta di validazione xpath");
            let social = message.social;
            const pathValidator = new PathValidator(social);
            await pathValidator.validate();

            chrome.runtime.sendMessage({
                action: "finishedValidation", 
                errors: pathValidator.errors.map(e => {
                    const base = { message: e.message };
                    if (e instanceof ParseError) {
                        base.selector = e.selector;
                    }

                    return base;
                })
            });

            break;
    }
})