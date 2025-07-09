//xpath per immagine del post //article//img[@alt], migliorata per evitare di prendere anche foto profilo in,
// '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]'
//xpath per caption //article//h1
//xpath per numero di mi piace '//article//section//a/span[text()]/span'
class PostScraper {
    static async scrapePost(){
        console.log("Inizio scraping del post");
        const post = XPathManager.getOne('//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]');
        if(!post) console.log("Scrape di un video");
        const postUrl = post?.src || "Video";
        const postCaption = XPathManager.getOne('//article//h1').innerText; //selettore caption post
        const postLikes = XPathManager.getOne('//article//section//a/span[text()]/span').innerText;
        return new Post(postUrl, postCaption, postLikes, []);
    }
}