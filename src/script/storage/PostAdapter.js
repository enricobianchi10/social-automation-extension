class PostAdapter extends StorageService {
    constructor(){
        super();
    }

    static async save(post){
        await chrome.storage.local.set({ [post.url]: post });
    }

    static async get(url){
        const result = await chrome.storage.local.get(url);
        const post = result[url];
        return new Post(post.url, post.author, post.comments);
    }
}

