const mockdata = {
    url: 'https://www.instagram.com/p/DLzs4UaNlqw/',
    author: 'account_prova1212',
    text: 'commento 2',
    replies: 'commento postato automaticamente'
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "publishComment":
            let social = message.social;
            console.log("Ricevuta richiesta di pubblicare un commento");
            await InstagramPageNavigator.goToProfile(social);
            await InstagramPageNavigator.openLastPost(social);
            await CommentPublisher.publishRepliesToComment(mockdata.url, mockdata.author, mockdata.text, mockdata.replies, social);
    }
})