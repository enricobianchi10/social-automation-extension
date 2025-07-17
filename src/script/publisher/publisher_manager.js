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
            await InstagramPageNavigator.goToProfile(social);
            for(const mockdata of mockdatas){
                await InstagramPageNavigator.openLastPost(social);
                await CommentPublisher.publishRepliesToComment(mockdata.url, mockdata.author, mockdata.text, mockdata.replies, social);
            }
            break;
    }
})