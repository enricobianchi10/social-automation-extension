const mockdatas = [
    {
        url: 'https://www.instagram.com/p/DLkPkcLtGy1/',
        author: 'account_prova1212',
        text: 'comment 1',
        replies: 'commento postato automaticamente'
    },
    {
        url: 'https://www.instagram.com/p/DLzs4UaNlqw/',
        author: 'account_prova1212',
        text: 'commento 2',
        replies: 'commento postato automaticamente'
    },
    {
        url: 'https://www.instagram.com/p/DL0GFPrNZYs/',
        author: 'account_prova1212',
        text: 'commento nuovo1',
        replies: 'commento postato automaticamente'
    },
    {
        url: 'https://www.instagram.com/p/DLzs4UaNlqw/',
        author: 'account_prova1212',
        text: 'commento 3',
        replies: 'commento postato automaticamente'
    }
];

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "publishComment":
            let social = message.social;
            console.log("Ricevuta richiesta di pubblicare un commento");
            try {
                await InstagramPageNavigator.goToProfile(social);
            }
            catch(err) {
                chrome.runtime.sendMessage({
                    action: "showError",
                    error: {
                        message: err.message,
                        url: err.url
                    }
                });
                return;
            }
            
            for(const mockdata of mockdatas){
                try {
                    await InstagramPageNavigator.openLastPost(social);
                }
                catch(err) {
                    chrome.runtime.sendMessage({
                        action: "showError",
                        error: {
                            message: err.message,
                            url: err.url
                        }
                    });
                    return;
                }
                
                try {
                    await CommentPublisher.publishRepliesToComment(mockdata.url, mockdata.author, mockdata.text, mockdata.replies, social);
                }
                catch(err) {
                    chrome.runtime.sendMessage({
                        action: "showError",
                        error: {
                            message: err.message,
                            url: err.url
                        }
                    });
                    return;
                }
            }
            console.log("Terminato publish dei commenti");
            chrome.runtime.sendMessage({ action: "finishedPublish"});
            break;
    }
})