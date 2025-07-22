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
        console.log("Url attuale: " + window.location.href + " Url post: " + url_post);
        while(this.postNavigator.hasNextBtn && !isSamePost(window.location.href, url_post)){
            try {
                await this.postNavigator.next();
            }
            catch (err) {
                console.log("Ricevuto errore di raggiungimento nuovo post");
                throw err;
            }
        }
        console.log("Url attuale: " + window.location.href + " Url post: " + url_post);
    }
}