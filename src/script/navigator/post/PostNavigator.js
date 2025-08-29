class PostNavigator {
    constructor(post_url, social){
        this._postUrl = post_url;
        this._social = social;
        this._hasNextBtn = true;
    }

    get hasNextBtn(){
        return this._hasNextBtn;
    }

    set hasNextBtn(hasNextBtn){
        this._hasNextBtn = hasNextBtn;
    }

    get postUrl(){
        return this._postUrl;
    }

    set postUrl(post_url){
        this._postUrl = post_url;
    }

    get social(){
        return this._social;
    }

    set social(social){
        this._social = social;
    }

    async next(){
        const nextBtn = XPathManager.getOne(SELECTORS[this.social].newPostButton); //selettore per andare avanti di post
        if(!nextBtn){
            this.hasNextBtn = false;
        }
        else {
            nextBtn.click();
            try {
                await ChangeDetector.waitForUrlChanges(this.postUrl);
                this.postUrl = window.location.href;
            }
            catch (err) {
                this.hasNextBtn = false;
                throw err;
            }
        }
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = PostNavigator;
}