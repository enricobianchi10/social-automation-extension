chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "scrapePost":
            console.log("Ricevuta richiesta di scraping di tutti i post");
            let postNavigator = new PostNavigator();
            while(postNavigator.hasNextBtn){
                let post = await scrapeSinglePost(); //scrapePost giusto static?
                chrome.runtime.sendMessage({ action: "savePost", post: post });
                postNavigator.postUrl = post.url;
                await postNavigator.goToNextPost();
            }
            console.log("Terminato scraping dei post");
            chrome.runtime.sendMessage({ action: "finishedScrape"});
    }
})

async function scrapeSinglePost(){
    let post = await PostScraper.scrapePost();
    console.log("Trovato URL del post:", post.url);
    console.log("Trovato SRC immagine del post:", post.src);
    console.log("Trovata caption del post:", post.caption);
    console.log("Trovato numero likes del post:", post.likesNumber);
    //ora andrebbe fatto scraping dei commenti tramite comment scraper e poi aggiungerli al post generato da postScraper
    let commentNavigator = new CommentNavigator();
    await commentNavigator.loadAllComments();
    let comments = await CommentScraper.scrapeComment();
    post.comments = comments;
    console.log("Trovati commenti al post:", post.comments);
    return post;
}