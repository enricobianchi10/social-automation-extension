//xpath per trovare autori ai commenti '//article//h3', migliorata per escludere autori di commenti con gif, '//article//h3[not(following-sibling::div[1]/img)]'
//xapth per trovare testi dei commenti '//article//h3/following-sibling::div[1]/span' (funziona anche senza article)
//testi commenti migliorato per non prendere replies '//article//h3/following-sibling::div[1]/span[not(ancestor::ul/ancestor::li/ancestor::ul)]'
//autori commenti migliorato per non prendere replies '//article//h3[not(following-sibling::div[1]/img) and not(ancestor::ul/ancestor::li/ancestor::ul)]'

class CommentScraper {

    constructor(comment_navigator){
        this._commentNavigator = comment_navigator;
        this._social = comment_navigator.social;
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

    async scrapeAll(){
        await this.commentNavigator.next();
        console.log("Inizio scraping dei commenti");
        const listTextComment = XPathManager.getAll(SELECTORS[this.social].commentText);
        const listAuthorComment = XPathManager.getAll(SELECTORS[this.social].commentAuthor);
        console.log("Trovata lista testi commenti di lunghezza:", listTextComment.length);
        console.log("Trovata lista autori commenti di lunghezza:", listAuthorComment.length);
        let comments = [];
        listTextComment.forEach((node,index) => {
            const text = node.innerText;
            const author = listAuthorComment[index]?.innerText || "Autore non trovato";
            const comment = new Comment(author, text);
            comments.push(comment);
        });

        return comments;
    }
}

//problema che per ora prendono anche le replies se visibili