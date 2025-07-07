class PostScraper {
    static async scrapePost(){
        console.log("Inizio scraping del post");
        // per facebook ma bannato const post = document.querySelector('img[data-visualcompletion]');
        const postList = document.querySelectorAll("div._aagv > img[alt]");
        const post = postList[postList.length - 1];
        const postUrl = post?.src || null;
        // per facebook ma bannato const postCaption = document.querySelector(".x1g2khh7 .xzsf02u").innerText; selettore per caption del post
        const postCaption = document.querySelector("h1[dir]").innerText; //selettore caption post
        return new Post(postUrl, postCaption, []);
    }
}