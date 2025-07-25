class LocalStoragePostAdapter extends StorageService {
    constructor(){
        super();
    }

    async save(post){
        const postToSave = { ...post }; //shallow copy (no copia profonda)
        const commentsObj = {};
        for (const comment of post._comments) {
            const commentId = await generateCommentId(comment._author, comment._text);
            commentsObj[commentId] = comment;
        }
        postToSave._comments = commentsObj;
        const result = await chrome.storage.local.get("postList");
        const postList = result.postList || {};
        const postKey = "post_" + post._number;
        postList[postKey] = postToSave;
        await chrome.storage.local.set({postList});
        const items = await chrome.storage.local.get("postList");
        console.log('Contenuto di postList in chrome.storage.local:', items);
    }

    async get(number){
        const result = await chrome.storage.local.get("postList");
        const post = result.postList?.[number];
        if(!post) return null;
        return new Post(post._number, post._url, post._scr, post._caption, post._likes_number, post._comments);
    }

    async getAll(){
        const result = await chrome.storage.local.get("postList");
        return result.postList;
    }
}

