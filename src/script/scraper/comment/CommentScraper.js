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
        const listTextComment = XPathManager.getAll(SELECTORS[this.social].commentText);
        const listAuthorComment = XPathManager.getAll(SELECTORS[this.social].commentAuthor);
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

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CommentScraper;
}