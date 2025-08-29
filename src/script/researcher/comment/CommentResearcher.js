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
        await this.postResearcher.find(url_post);
        if(this.postResearcher.postNavigator.postUrl !== url_post){
            return false;
        }
        await this.commentNavigator.next(); //tutti i commenti caricati
        const commentBoxList = XPathManager.getAll(SELECTORS[this.social].boxComment);
        const commentBoxFiltred = commentBoxList.filter(node => node.querySelector('h3').innerText === author_comment && node.querySelectorAll('span')[2].innerText === text_comment);
        if(commentBoxFiltred.length > 0) {
            return commentBoxFiltred[0].querySelector('button');
        }
        else {
            return false;
        }
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CommentResearcher;
}