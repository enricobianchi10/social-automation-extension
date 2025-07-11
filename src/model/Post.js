class Post {
    constructor(url, src, caption, likes_number, comments){
        this._url = url;
        this._src = src;
        this._caption = caption;
        this._likes_number = likes_number;
        this._comments = comments;
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
}