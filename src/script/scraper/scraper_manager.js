chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "scrapePost":

            let social = message.social;
            console.log("Ricevuta richiesta di scraping di tutti i post");
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
            
            const lastPostUrl = window.location.href;

            let commentNavigator = new CommentNavigator(social);
            let commentScraper = new CommentScraper(commentNavigator);
            let postNavigator = new PostNavigator(lastPostUrl, social);
            let postScraper = new PostScraper(postNavigator, commentScraper);

            let posts;
            try {
                posts = await postScraper.scrapeAll();
            }
            catch(err){

                chrome.runtime.sendMessage({
                    action: "showError",
                    error: {
                        message: err.message,
                        url: err.url
                    }
                });
                return;
            }

            for(const post of posts){
                await sendSavePostMessage(post);
            }
            chrome.runtime.sendMessage({ action: "finishedScrape", lastPost: postScraper.postNavigator.postUrl});
    }
    return true;
})

async function sendSavePostMessage(post) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "savePost", post: post }, (response) => {
        resolve(response);
        });
    });
}