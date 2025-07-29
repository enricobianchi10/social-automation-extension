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
            console.log("Nessun pulsante di prossimo post trovato");
            this.hasNextBtn = false;
        }
        else {
            console.log("Pulsante per prossimo post trovato!");
            nextBtn.click();
            //await delay(3000); //per verificare che è stato caricato il post nuovo verificare cambio url
            try {
                await ChangeDetector.waitForUrlChanges(this.postUrl);
                console.log("Nuovo post raggiunto");
                this.postUrl = window.location.href;
            }
            catch (err) {
                console.log("Errore nel raggiungimento del nuovo post");
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