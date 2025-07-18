//xpath per bottone avanti '//button[.//*[@aria-label="Avanti"]]' (si può anche fare inerente al testo dentro e non aria-label)
class PostNavigator {
    constructor(post_url){
        this._postUrl = post_url;
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

    async goToNextPost(social){
        const nextBtn = XPathManager.getOne(SELECTORS[social].newPostButton); //selettore per andare avanti di post
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

    async findPost(social, url_post){
        console.log("Url attuale: " + window.location.href + " Url post: " + url_post);
        while(this.hasNextBtn && window.location.href !== url_post){
            try {
                await this.goToNextPost(social);
            }
            catch (err) {
                console.log("Ricevuto errore di raggiungimento nuovo post");
                throw err;
            }
        }
        console.log("Url attuale: " + window.location.href + " Url post: " + url_post);
    }
}