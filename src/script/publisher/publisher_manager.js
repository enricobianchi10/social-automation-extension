chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "publishComment":
            let social = message.social;
            console.log("Ricevuta richiesta di pubblicare un commento");
            
            let commentNavigator = new CommentNavigator(social);
            let postNavigator = new PostNavigator(social);
            let postResearcher = new PostResearcher(postNavigator);
            let commentResearcher = new CommentResearcher(postResearcher, commentNavigator)
            let commentPublisher = new CommentPublisher(commentResearcher);

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

            const result = await chrome.storage.local.get('commentToPublish');
            const comments = result.commentToPublish;
            
            for(const comment of comments){
                
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
                    return;
                }
            }

            console.log("Terminato publish dei commenti");
            chrome.runtime.sendMessage({ action: "finishedPublish"});
            break;
    }
    return true;
})