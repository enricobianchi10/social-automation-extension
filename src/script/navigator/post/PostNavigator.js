//xpath per bottone avanti '//button[.//*[@aria-label="Avanti"]]' (si può anche fare inerente al testo dentro e non aria-label)
class PostNavigator {
    constructor(post_url){
        this._post = post_url;
        this._hasNextBtn = true;
    }

    get hasNextBtn(){
        return this._hasNextBtn;
    }

    set hasNextBtn(hasNextBtn){
        this._hasNextBtn = hasNextBtn;
    }

    get post(){
        return this._post;
    }

    set post(post_url){
        this._post = post_url;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async goToNextPost(){
        const nextBtn = XPathManager.getOne('//button[.//*[@aria-label="Avanti"]]'); //selettore per andare avanti di post
        if(!nextBtn){
            console.log("Nessun pulsante di prossimo post trovato");
            this.hasNextBtn = false;
            return false;
        }
        else {
            console.log("Pulsante per prossimo post trovato!");
            nextBtn.click();
            await this.delay(3000); //si può probabilmente migliorare con l'utilizzo di MutationObserver
            return true;
        }
    } 
}