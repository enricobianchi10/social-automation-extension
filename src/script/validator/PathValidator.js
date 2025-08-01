class PathValidator {
    constructor(social, errors = null){ //in modo che attributo errors sia sempre un array
        this._social = social;
        if (!errors) {
            this._errors = [];
        } else if (Array.isArray(errors)) {
            this._errors = errors;
        } else {
            this._errors = [errors];
        }
    }

    get social(){
        return this._social;
    }

    get errors(){
        return this._errors;
    }

    set errors(errors){
        if (!errors) {
            this._errors = [];
        } else if (Array.isArray(errors)) {
            this._errors = errors;
        } else {
            this._errors = [errors];
        }
    }

    _addError(error){
        this._errors.push(error);
    }

    _clearErrors(){
        this._errors = [];
    }

    async validate(){
        await delay(2000); //aspetta 2 secondi per far caricare i post
        await this._validatePostScraping();
        await delay(2000); //aspetta 2 secondi per far caricare post successivo
        await this._validatePublishing();
        await this._validateProfileReaching();
    }

    async _validateCommentScraping(){ //cerca di ottenere tutti i commenti dell'ultimo post dell'account di test (20 commenti principali)
        const nextCommBtn = XPathManager.getOne(SELECTORS[this.social].newCommentsButton);
        if(!nextCommBtn){
            this._addError(new ParseError("Pulsante per caricare nuovi commenti non trovato", SELECTORS[this.social].newCommentsButton));
            const listTextComment = XPathManager.getAll(SELECTORS[this.social].commentText);
            const listAuthorComment = XPathManager.getAll(SELECTORS[this.social].commentAuthor);
            if(listTextComment.length === 0){
                this._addError(new ParseError("Testi dei commenti non trovati", SELECTORS[this.social].commentText));
            }
            if(listAuthorComment.length === 0){
                this._addError(new ParseError("Autori dei commenti non trovati", SELECTORS[this.social].commentAuthor));
            }
            return;
        }
        else {
            nextCommBtn.click();
            try { //pulsante per visualizzare i nuovi commenti premuto, aspetto che si carichino
                await ChangeDetector.waitForLoading();
            } 
            catch { //se il caricamento richiede troppo tempo non controllo che i commenti siano 20 perchè non li carica tutti (controllo solo se ne vengono trovati)
                this._addError(new Error("Il caricamento dei nuovi commenti ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione"));
                const listTextComment = XPathManager.getAll(SELECTORS[this.social].commentText);
                const listAuthorComment = XPathManager.getAll(SELECTORS[this.social].commentAuthor);
                if(listTextComment.length === 0){
                    this._addError(new ParseError("Testi dei commenti non trovati", SELECTORS[this.social].commentText));
                }
                if(listAuthorComment.length === 0){
                    this._addError(new ParseError("Autori dei commenti non trovati", SELECTORS[this.social].commentAuthor));
                }
                return;
            }       
            //pulsante per caricare commenti trovato e tutti i commenti caricati, controllo che vengano trovati e che siano nel numero giusto 
            const listTextComment = XPathManager.getAll(SELECTORS[this.social].commentText);
            const listAuthorComment = XPathManager.getAll(SELECTORS[this.social].commentAuthor);

            if(listTextComment.length === 0){
                this._addError(new ParseError("Testi dei commenti non trovati", SELECTORS[this.social].commentText));
            }
            if(listAuthorComment.length === 0){
                this._addError(new ParseError("Autori dei commenti non trovati", SELECTORS[this.social].commentAuthor));
            }
            if(listTextComment.length < 20){
                this._addError(new ParseError("Numero totale di commenti trovati errato", SELECTORS[this.social].commentText));
            }
            if(listAuthorComment.length < 20){
                this._addError(new ParseError("Numero totale di autori dei commenti trovati errato", SELECTORS[this.social].commentAuthor));
            }
            return;
        }
    }

    async _validatePostScraping(){ //cerca di ottenere tutti i dati dell'ultimo post dell'account di test (aprendo anche l'ultimo post dal link)
        const postNumber = XPathManager.getOne(SELECTORS[this.social].postNumber);
        if(!postNumber){
            this._addError(new ParseError("Numero di post non trovato", SELECTORS[this.social].postNumber));
        }
        else if(postNumber.textContent !== "5"){
            this._addError(new ParseError("Numero di post trovato ma errato", SELECTORS[this.social].postNumber));
        }

        const lastPostLink = XPathManager.getOne(SELECTORS[this.social].lastPostLink);
        if(!lastPostLink){ //se non trova link per caricare ultimo profilo non ha senso controllare altri selettori
            this._addError(new ParseError("Link all'ultimo post del profilo non trovato", SELECTORS[this.social].lastPostLink));
            return;
        }
        let urlPage = window.location.href;
        lastPostLink.click();
        try {
            await ChangeDetector.waitForUrlChanges(urlPage);
        } catch(err) {
            this._addError(new Error("Il caricamento del post ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione"));
            return;
        }
        //link trovato e url cambiato
        urlPage = window.location.href;
        if(!urlPage.includes('instagram.com/p/DMxM7zeNex4/')){ //url dell'ultimo post del profilo di test
            this._addError(new ParseError("Link all'ultimo post ha portato al post errato", SELECTORS[this.social].lastPostLink));
            return;
        }
        try {
            await ChangeDetector.waitForLoading();
        } catch(err) {}
        //arrivato qua dovrei aver caricato correttamente l'ultimo post, controllo selettori
        const postImg = XPathManager.getOne(SELECTORS[this.social].postImage);
        const postCaption = XPathManager.getOne(SELECTORS[this.social].postCaption);
        const postLikes = XPathManager.getOne(SELECTORS[this.social].postLikesNumber);
        //controllo che sino stati trovati i nodi
        if(!postImg){
            this._addError(new ParseError("Url dell'immagine del post non trovato", SELECTORS[this.social].postImage));
        }
        if(!postCaption){
            this._addError(new ParseError("Caption del post non trovata", SELECTORS[this.social].postCaption));
        }
        if(!postLikes){
            this._addError(new ParseError("Numero likes del post non trovato", SELECTORS[this.social].postLikesNumber));
        }
        //ora controllo che caption e likes siano corretti
        if(postCaption && postCaption.innerText !== "Caption"){
            this._addError(new ParseError("Caption del post trovata ma errata", SELECTORS[this.social].postCaption));
        }
        if(postLikes && Number(postLikes.innerText) < 2){ //c'è il like del profilo quindi deve trovare almeno un like
            this._addError(new ParseError("Numero likes del post trovato ma errato", SELECTORS[this.social].postLikesNumber));
        }

        await this._validateCommentScraping();
        //ora controllo che il pulsante per andare al prossimo post funzioni
        const nextPostBtn = XPathManager.getOne(SELECTORS[this.social].newPostButton);
        if(!nextPostBtn){
            this._addError(new ParseError("Pulsante per raggiungere post successivo non trovato", SELECTORS[this.social].newPostButton));
            return;
        }
        nextPostBtn.click();
        urlPage = window.location.href;
        try {
            await ChangeDetector.waitForUrlChanges(urlPage);
        }
        catch (err) {
            this._addError(new Error("Il caricamento del nuovo post ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione"));
            return;
        }
        //url cambiato, verifico che abbia raggiunto il post corretto
        urlPage = window.location.href;
        if(!urlPage.includes('instagram.com/p/DMp-WpEt_hR/')){ //url del penultimo post del profilo di test
            this._addError(new ParseError("Pulsante per raggiungere post successivo ha portato al post errato", SELECTORS[this.social].newPostButton));
        }
        return;
    }

    async _validatePublishing(){ //cerca di simulare la publish di un commento (senza clickare tasto pubblica), lo fa in un post successivo all'ultimo (commenti bloccati)
        const commentBoxList = XPathManager.getAll(SELECTORS[this.social].boxComment);
        if(commentBoxList.length === 0){
            this._addError(new ParseError("Lista dei commenti non trovata", SELECTORS[this.social].boxComment));
            return;
        }
        //trovata lista di box di commenti, la filtro cercando l'unico commento presente per vedere se lo trova
        const commentBoxFiltred = commentBoxList.filter(node => node.querySelector('h3').innerText === "account_prova1212" && node.querySelectorAll('span')[2].innerText === "commento nuovo1");
        if(commentBoxFiltred.length < 1){
            this._addError(new ParseError("Il filtraggio dei commenti non è andato a buon fine", SELECTORS[this.social].boxComment));
            return;
        }
        const replyBtn = commentBoxFiltred[0].querySelector('button');
        if(!replyBtn){
            this._addError(new ParseError("Pulsante per rispondere ad un commento non trovato", "commentBoxFiltred[0].querySelector('button')"));
            return;
        }
        replyBtn.click();
        await ChangeDetector.waitForLoading();
        const repliesTextArea = XPathManager.getOne(SELECTORS[this.social].repliesTextArea);
        if(!repliesTextArea){
            this._addError(new ParseError("Area di testo per la risposta al commento non trovata", SELECTORS[this.social].repliesTextArea));
            return;
        }
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeValueSetter.call(repliesTextArea, "prova");
        repliesTextArea.dispatchEvent(new Event('input', { bubbles: true }));
        const publishButton = XPathManager.getOne(SELECTORS[this.social].publishCommentButton);
        if(!publishButton){
            this._addError(new ParseError("Pulsante per pubblicare la risposta al commento non trovato", SELECTORS[this.social].publishCommentButton));
        }
        return;
    }

    async _validateProfileReaching(){ //verifica che il pulsante per raggiungere il proprio profilo si trovi e funzioni
        const urlPage = window.location.href;
        const profileLink = XPathManager.getOne(SELECTORS[this.social].profileLink);
        if(!profileLink){
            this._addError(new ParseError("Link per raggiungere il proprio profilo non trovato", SELECTORS[this.social].profileLink));
            return;
        }
        profileLink.click();
        try {
            await ChangeDetector.waitForUrlChanges(urlPage);
        }
        catch (err) {
            this._addError(new Error("Il caricamento del profilo ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione"))
        }
    }
}