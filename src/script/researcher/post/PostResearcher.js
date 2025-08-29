class PostResearcher {
    constructor(post_navigator){
        this._postNavigator = post_navigator;
        this._social = post_navigator.social;
    }

    get postNavigator(){
        return this._postNavigator;
    }

    set postNavigator(post_navigator){
        this._postNavigator = post_navigator;
    }

    get social(){
        return this._social;
    }

    set social(social){
        this._social = social;
    }

    async find(url_post){
        while(this.postNavigator.hasNextBtn && !isSamePost(window.location.href, url_post)){
            await this.postNavigator.next();
        }
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = PostResearcher;
}