//ipotizzando di ricevere un dato con i campi: urlPost, author comment, text comment

class CommentResearcher {

    constructor(post_researcher, comment_navigator){
        this._postResearcher = post_researcher;
        this._commentNavigator = comment_navigator;
        this._social = comment_navigator.social;
    }

    get postResearcher(){
        return this._postResearcher;
    }

    set postResearcher(post_researcher){
        this._postResearcher = post_researcher;
    }

    get commentNavigator(){
        return this._commentNavigator;
    }

    set commentNavigator(comment_navigator){
        this._commentNavigator = comment_navigator;
    }

    get social(){
        return this._social;
    }

    set social(social){
        this._social = social;
    }

    async find(url_post, author_comment, text_comment){ //restituisce il puslante per rispondere al commento che ha autore e testo ricevuti
        try {
           await this.postResearcher.find(url_post);
           if(this.postResearcher.postNavigator.postUrl !== url_post){
             console.log("Post in cui cercare il commento non trovato, url post non trovato: " + url_post);
             return false;
           }
        }
        catch(err){
            console.log("Ricevuto errore di raggiungimento nuovo post (da navigator)");
            throw err;
        }
        await this.commentNavigator.next(); //tutti i commenti caricati
        const commentBoxList = XPathManager.getAll(SELECTORS[this.social].boxComment);
        if(commentBoxList.length > 0) console.log("Box commenti caricati");
        const commentBoxFiltred = commentBoxList.filter(node => node.querySelector('h3').innerText === author_comment && node.querySelectorAll('span')[2].innerText === text_comment);
        if(commentBoxFiltred.length > 0) {
            console.log("Box del commento trovato");
            return commentBoxFiltred[0].querySelector('button');
        }
        else {
            console.log("Box del commento non trovato");
            return false;
        }
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CommentResearcher;
}