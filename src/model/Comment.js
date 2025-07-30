class Comment {
    constructor(author, text){
        this._author = author;
        this._text = text;
    }

    get author(){
        return this._author;
    }

    get text() {
        return this._text;
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Comment;
}
