class Post {
    constructor(url, caption, comments){
        this._url = url;
        this._caption = caption;
        this._comments = comments;
    }

    get url() {
        return this._url;
    }

    get caption(){
        return this._caption;
    }
    
    get comments(){
        return this._comments;
    }

    set comments(comments){
        this._comments = comments;
    }
}