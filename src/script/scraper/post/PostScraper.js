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
            return 0;
        }
        return Number(postNumber);
    } 

    async _scrape(postNumber){
        const postUrl = window.location.href.split('?')[0];
        const postImg = XPathManager.getOne(SELECTORS[this.social].postImage);
        const postImgSrc = postImg?.src || "Video";
        const postCaption = XPathManager.getOne(SELECTORS[this.social].postCaption)?.innerText || "Nessuna caption"; //selettore caption post
        const postLikes = XPathManager.getOne(SELECTORS[this.social].postLikesNumber)?.innerText || "0";
        let comments = await this.commentScraper.scrapeAll(); 
        return new Post(postNumber, postUrl, postImgSrc, postCaption, postLikes, comments);
    }

    async scrapeAll(){
        let posts = [];
        let postNumber = this._getPostNumber();
        while(this.postNavigator.hasNextBtn){
            let post = await this._scrape(postNumber); 
            posts.push(post);
            postNumber--;
            await this.postNavigator.next();
        }
        return posts;
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = PostScraper;
}