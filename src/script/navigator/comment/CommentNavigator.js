//xpath per svg carica altri commenti "'//*[local-name()="svg" and ancestor::article and @aria-label="Carica altri commenti"]'"
//xapth per button, non serve closest, //article//button[.//*[@aria-label="Carica altri commenti"]]


class CommentNavigator {
    constructor(social){
        this._hasNewCommBtn = true;
        this._social = social;
    }

    get hasNewCommBtn(){
        return this._hasNewCommBtn;
    }

    set hasNewCommBtn(hasNewCommBtn){
        this._hasNewCommBtn = hasNewCommBtn;
    }

    get social(){
        return this._social;
    }

    set social(social){
        this._social = social;
    }

    async next(){
        
        this.hasNewCommBtn = true;
        if(!ChangeDetector.checkIfCommentLoad(this.social)){ // viene fatto il check se i primi commenti sono già stati caricati o meno e nel caso aspetta il caricamento
            try {
                await ChangeDetector.waitForLoading();
                console.log("Caricati primi commenti");
            } 
            catch {
                console.log("Commenti non presenti o errore nel loro caricamento");
            }
        }   
        while(this.hasNewCommBtn){
            const nextCommBtn = XPathManager.getOne(SELECTORS[this.social].newCommentsButton);
            if(!nextCommBtn){
                console.log("Nessun pulsante di nuovi commenti");
                this.hasNewCommBtn = false;
            }
            else {
                console.log("Pulsante per caricare commenti trovato!");
                nextCommBtn.click();
                //await delay(3000);
                try { //pulsante per visualizzare i nuovi commenti premuto, aspetto che si carichino
                    await ChangeDetector.waitForLoading();
                    console.log("Caricati nuovi commenti");
                } 
                catch {
                    console.log("Il caricamento dei commenti ha richiesto troppo tempo"); //problemi di connessione
                }
            }
        }
    } 
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CommentNavigator;
}