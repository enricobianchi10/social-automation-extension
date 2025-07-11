//xpath per immagine del post //article//img[@alt], migliorata per evitare di prendere anche foto profilo in,
// '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]'
//xpath per caption //article//h1
//xpath per numero di mi piace '//article//section//a/span[text()]/span'
class PostScraper {
    static async scrapePost(){
        console.log("Inizio scraping del post");
        const postUrl = window.location.href.split('?')[0];
        const postImg = XPathManager.getOne('//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]');
        if(!postImg) console.log("Scrape di un video");
        const postImgSrc = postImg?.src || "Video";
        const postCaption = XPathManager.getOne('//article//h1')?.innerText || "Nessuna caption"; //selettore caption post
        const postLikes = XPathManager.getOne('//article//section//a/span[text()]/span')?.innerText || "0";
        return new Post(postUrl, postImgSrc, postCaption, postLikes, []);
    }
}