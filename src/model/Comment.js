class Comment {
    constructor(author, text, replies){
        this._author = author;
        this._text = text;
        this._replies = replies;
    }

    get author(){
        return this._author;
    }

    get text() {
        return this._text;
    }

    get replies() {
        return this._replies;
    }
}