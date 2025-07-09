//xpath per svg carica altri commenti "'//*[local-name()="svg" and ancestor::article and @aria-label="Carica altri commenti"]'"
//xapth per button, non serve closest, //article//button[.//*[@aria-label="Carica altri commenti"]]


class CommentNavigator {
    constructor(){
        this._hasNewCommBtn = true;
    }

    get hasNewCommBtn(){
        return this._hasNewCommBtn;
    }

    set hasNewCommBtn(hasNewCommBtn){
        this._hasNewCommBtn = hasNewCommBtn;
    }

    async loadAllComments(){
        this.hasNewCommBtn = true;
        while(this.hasNewCommBtn){
            const nextCommBtn = XPathManager.getOne('//article//button[.//*[@aria-label="Carica altri commenti"]]');
            if(!nextCommBtn){
                console.log("Nessun pulsante di nuovi commenti");
                this.hasNewCommBtn = false;
            }
            else {
                console.log("Pulsante per caricare commenti trovato!");
                nextCommBtn.click();
                await delay(3000); //si può probabilmente migliorare con l'utilizzo di MutationObserver
            }
        }
    } 
}