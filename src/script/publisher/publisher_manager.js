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

            const result = await chrome.storage.local.get('commentToPublish');
            const comments = result.commentToPublish;

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
                    return;
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
                    return;
                }
            }

            console.log("Terminato publish dei commenti");
            chrome.runtime.sendMessage({ action: "finishedPublish"});
            break;
    }
    return true;
})