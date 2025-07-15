class PostAdapter extends StorageService {
    constructor(){
        super();
    }

    static async save(post){
        const result = await chrome.storage.local.get("postList");
        const postList = result.postList || {};
        const postKey = "post_" + post._number;
        postList[postKey] = post;
        await chrome.storage.local.set({postList});
        const items = await chrome.storage.local.get("postList");
        console.log('Contenuto di postList in chrome.storage.local:', items);
    }

    static async get(number){
        const result = await chrome.storage.local.get("postList");
        const post = result.postList?.[number];
        if(!post) return null;
        return new Post(post._number, post._url, post._scr, post._caption, post._likes_number, post._comments);
    }

    static async getAll(){
        const result = await chrome.storage.local.get("postList");
        return result.postList;
    }
}

