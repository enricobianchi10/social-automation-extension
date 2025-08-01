/* const replies = [
    {
        "url": "https://www.instagram.com/p/DLkPkcLtGy1/",
        "author": "account_prova1212",
        "text": "comment 1",
        "replies": "commento postato automaticamente"
    },
    {
        "url": "https://www.instagram.com/p/DLzs4UaNlqw/",
        "author": "account_prova1212",
        "text": "commento 2",
        "replies": "commento postato automaticamente"
    },
    {
        "url": "https://www.instagram.com/p/DLzs4UaNlqw/",
        "author": "account_prova1212",
        "text": "commento 3",
        "replies": "commento postato automaticamente"
    },
    {
        "url": "https://www.instagram.com/p/DL0GFPrNZYs/",
        "author": "account_prova1212",
        "text": "commento nuovo1",
        "replies": "commento postato automaticamente"
    }
]; */

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
                break;
            }

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
                break;
            }

            const comments = message.replies;
            console.log("Commenti da postare: " + comments);

            const lastPostUrl = window.location.href;
            
            let commentNavigator = new CommentNavigator(social);
            let postNavigator = new PostNavigator(lastPostUrl, social);
            let postResearcher = new PostResearcher(postNavigator);
            let commentResearcher = new CommentResearcher(postResearcher, commentNavigator)
            let commentPublisher = new CommentPublisher(commentResearcher);
            
            for(const comment of comments){
                
                try {
                    await commentPublisher.publish(comment.url, comment.author, comment.text, comment.replies);
                }
                catch(err) {
                    chrome.runtime.sendMessage({
                        action: "showError",
                        error: {
                            message: err.message,
                            url: err.url
                        }
                    });
                    break;
                }

                try {
                    await InstagramPageNavigator.openLastPost(social);
                    postNavigator.postUrl = lastPostUrl;
                }
                catch(err) {
                    chrome.runtime.sendMessage({
                        action: "showError",
                        error: {
                            message: err.message,
                            url: err.url
                        }
                    });
                    break;
                }
            }

            console.log("Terminato publish dei commenti");
            chrome.runtime.sendMessage({ action: "finishedPublish"});
            break;
    }
})