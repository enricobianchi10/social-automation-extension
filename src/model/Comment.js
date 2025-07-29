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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Comment;
}
