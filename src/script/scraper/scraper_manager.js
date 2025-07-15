chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "scrapePost":
            let social = message.social;
            console.log("Ricevuta richiesta di scraping di tutti i post");
            let postNumber = PostScraper.getPostNumber(social);
            console.log("Trovato numero totale dei post:", postNumber);
            let postNavigator = new PostNavigator();
            while(postNavigator.hasNextBtn){
                let post = await scrapeSinglePost(social, postNumber); 
                await sendSavePostMessage(post); //per aspettare il termine del salvataggio prima di proseguire
                postNumber = postNumber - 1;
                try {
                    await postNavigator.goToNextPost(social);
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
            console.log("Terminato scraping dei post");
            chrome.runtime.sendMessage({ action: "finishedScrape", lastPost: postNavigator.postUrl});
    }
})

async function scrapeSinglePost(social, postNumber){
    let post = PostScraper.scrapePost(social, postNumber);
    console.log("Numero del post:", post.number);
    console.log("Trovato URL del post:", post.url);
    console.log("Trovato SRC immagine del post:", post.src);
    console.log("Trovata caption del post:", post.caption);
    console.log("Trovato numero likes del post:", post.likesNumber);
    //ora andrebbe fatto scraping dei commenti tramite comment scraper e poi aggiungerli al post generato da postScraper
    let commentNavigator = new CommentNavigator();
    await commentNavigator.loadAllComments(social);
    let comments = await CommentScraper.scrapeComment(social);
    post.comments = comments;
    console.log("Trovati commenti al post:", post.comments);
    return post;
}

function sendSavePostMessage(post) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "savePost", post: post }, (response) => {
      resolve(response);
    });
  });
}