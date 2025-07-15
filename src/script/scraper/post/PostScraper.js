//xpath per immagine del post //article//img[@alt], migliorata per evitare di prendere anche foto profilo in,
// '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]'
//xpath per caption //article//h1
//xpath per numero di mi piace '//article//section//a/span[text()]/span'
class PostScraper {

    static getPostNumber(social){
        const postNumber = XPathManager.getOne(SELECTORS[social].postNumber)?.textContent || "Numero di post non trovato";
        return Number(postNumber);
    } 

    static scrapePost(social, postNumber){
        console.log("Inizio scraping del post");
        const postUrl = window.location.href.split('?')[0];
        const postImg = XPathManager.getOne(SELECTORS[social].postImage);
        if(!postImg) console.log("Scrape di un video");
        const postImgSrc = postImg?.src || "Video";
        const postCaption = XPathManager.getOne(SELECTORS[social].postCaption)?.innerText || "Nessuna caption"; //selettore caption post
        const postLikes = XPathManager.getOne(SELECTORS[social].postLikesNumber)?.innerText || "0";
        return new Post(postNumber, postUrl, postImgSrc, postCaption, postLikes, []);
    }
}