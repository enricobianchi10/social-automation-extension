//selettore per caricare nuovi commenti document.querySelector('svg[aria-label="Carica altri commenti"]').closest('button')

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

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async loadAllComments(){
        while(this.hasNewCommBtn){
            const nextCommBtn = document.querySelector('svg[aria-label="Carica altri commenti"]')?.closest('button');
            if(!nextCommBtn){
                console.log("Nessun pulsante di nuovi commenti");
                this.hasNewCommBtn = false;
            }
            else {
                console.log("Pulsante per caricare commenti trovato!");
                nextCommBtn.click();
                await this.delay(3000); //si può probabilmente migliorare con l'utilizzo di MutationObserver
            }
        }
    } 
}