class PostScraper {
    static async scrapePost(){
        console.log("Inizio scraping del post");
        const post = document.querySelector('img[data-visualcompletion]');
        const postUrl = post?.src || null;
        const postCaption = document.querySelector(".x1g2khh7 .xzsf02u")?.innerText; //selettore caption post
        return new Post(postUrl, postCaption, []);
    }
}