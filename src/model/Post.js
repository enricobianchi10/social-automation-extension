class Post {
    constructor(number, url, src, caption, likes_number, comments){
        this._number = number;
        this._url = url;
        this._src = src;
        this._caption = caption;
        this._likes_number = likes_number;
        this._comments = comments;
    }

    get number() {
        return this._number;
    }

    get url() {
        return this._url;
    }

    get src() {
        return this._src;
    }

    get caption(){
        return this._caption;
    }
    
    get likesNumber(){
        return this._likes_number;
    }

    get comments(){
        return this._comments;
    }

    set comments(comments){
        this._comments = comments;
    }

    set number(number){
        this._number = number;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Post;
}
