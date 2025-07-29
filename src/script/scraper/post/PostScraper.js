//xpath per immagine del post //article//img[@alt], migliorata per evitare di prendere anche foto profilo in,
// '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]'
//xpath per caption //article//h1
//xpath per numero di mi piace '//article//section//a/span[text()]/span'
class PostScraper {

    constructor(post_navigator, comment_scraper){
        this._postNavigator = post_navigator;
        this._commentScraper = comment_scraper;
        this._social = post_navigator.social;
    }

    get postNavigator(){
        return this._postNavigator;
    }

    set postNavigator(post_navigator){
        this._postNavigator = post_navigator;
    }

    get commentScraper(){
        return this._commentScraper;
    }

    set commentScraper(comment_scraper){
        this._commentScraper = comment_scraper;
    }

    get social(){
        return this._social;
    }
    
    set social(social){
        this._social = social;
    }

    _getPostNumber(){
        const postNumber = XPathManager.getOne(SELECTORS[this.social].postNumber)?.textContent;
        if(!postNumber) {
            console.log("Numero di post non trovato"); 
            return 0;
        }
        return Number(postNumber);
    } 

    async _scrape(postNumber){
        console.log("Inizio scraping del post");
        const postUrl = window.location.href.split('?')[0];
        const postImg = XPathManager.getOne(SELECTORS[this.social].postImage);
        if(!postImg) console.log("Scrape di un video");
        const postImgSrc = postImg?.src || "Video";
        const postCaption = XPathManager.getOne(SELECTORS[this.social].postCaption)?.innerText || "Nessuna caption"; //selettore caption post
        const postLikes = XPathManager.getOne(SELECTORS[this.social].postLikesNumber)?.innerText || "0";
        console.log("Numero del post:", postNumber);
        console.log("Trovato URL del post:", postUrl);
        console.log("Trovato SRC immagine del post:", postImgSrc);
        console.log("Trovata caption del post:", postCaption);
        console.log("Trovato numero likes del post:", postLikes);
        let comments = await this.commentScraper.scrapeAll(); 
        return new Post(postNumber, postUrl, postImgSrc, postCaption, postLikes, comments);
    }

    async scrapeAll(){
        console.log("Inizio scraping di tutti i post");
        let posts = [];
        let postNumber = this._getPostNumber();
        console.log("Ricevuto numero di post");
        while(this.postNavigator.hasNextBtn){
            let post = await this._scrape(postNumber); 
            posts.push(post);
            postNumber--;
            try {
                await this.postNavigator.next();
            }
            catch(err) {
                throw err;
            }
        }
        console.log("Terminato scraping dei post");
        return posts;
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = PostScraper;
}