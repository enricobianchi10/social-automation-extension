let postNavigator = new PostNavigator();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case "scrapePost":
            console.log("Ricevuta richiesta di scraping di tutti i post");
            while(postNavigator.hasNextBtn){
                oldPostUrl = (await scrapeSinglePost()).url; //si può migliorare rendendo scrapePost non static
                postNavigator.post = oldPostUrl;
                await postNavigator.goToNextPost();
            }
    }
})

async function scrapeSinglePost(){
    let post = await PostScraper.scrapePost();
    console.log("Trovato URL del post:", post.url);
    console.log("Trovata caption del post:", post.caption);
    //ora andrebbe fatto scraping dei commenti tramite comment scraper e poi aggiungerli al post generato da postScraper
    let comments = await CommentScraper.scrapeComment();
    post.comments = comments;
    console.log("Trovati commenti al post:", post.comments);
    return post;
}