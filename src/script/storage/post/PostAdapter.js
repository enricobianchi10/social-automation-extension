class PostAdapter extends StorageService {
    constructor(){
        super();
    }

    static async save(post){
        await chrome.storage.local.set({ [post._url]: post });
        const items = await chrome.storage.local.get(null);
        console.log('Contenuto di chrome.storage.local:', items);
    }

    static async get(url){
        const result = await chrome.storage.local.get(url);
        const post = result[url];
        return new Post(post._url, post._scr, post._caption, post._likes_number, post._comments);
    }

    static async getAll(){
        const result = await chrome.storage.local.get(null);
        return result;
    }
}

