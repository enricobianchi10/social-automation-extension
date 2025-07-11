//xpath che prende il testo di tutte le replies '//article//ul/li/ul//div/span[text()]'
//xpath per autori replies '//article//ul/li/ul//div/h3[not(following-sibling::div[1]/img)]'

class RepliesNavigator{
    constructor(){
        this._hasNewReplBtn = true;
    }

    get hasNewReplBtn(){
        return this._hasNewReplBtn;
    }

    set hasNewReplBtn(hasNewReplBtn){
        this._hasNewReplBtn = hasNewReplBtn;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async loadAllReplies(){ //carica tutte le replies per un post singolo
        this.hasNewReplBtn = true;
        while(this.hasNewReplBtn){
            const nextReplBtn = XPathManager.getOne('//article//button[.//*[contains(@aria-label, "Visualizza le risposte")]]');
        }
    }
}