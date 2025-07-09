let postNavigator = new PostNavigator();
let commentNavigator = new CommentNavigator();

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
    console.log("Trovato numero likes del post:", post.likesNumber);
    //ora andrebbe fatto scraping dei commenti tramite comment scraper e poi aggiungerli al post generato da postScraper
    await commentNavigator.loadAllComments();
    let comments = await CommentScraper.scrapeComment();
    post.comments = comments;
    console.log("Trovati commenti al post:", post.comments);
    return post;
}