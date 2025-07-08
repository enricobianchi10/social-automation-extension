//selettore lista span con testo dei commenti 'div.xt0psk2 > span[dir]'
//selettore lista con autori commenti '._a9ym > .x11njtxf .x568u83'
//selettore lista autori risposte ad un commento '._a9ye .x568u83'
//selettore lista con testo delle risposte ad un commento '._a9ye ._aade'

class CommentScraper {
    static async scrapeComment(){
        console.log("Inizio scraping dei commenti");

        const listTextComment = document.querySelectorAll("span.xzsf02u .x1vvkbs div");
        
        const listAuthorComment = document.querySelectorAll(".x1sibtaa.xzsf02u");
        console.log("Trovata lista testi commenti di lunghezza:", listTextComment.length);
        console.log("Trovata lista autori commenti di lunghezza:", listAuthorComment.length);
        let comments = [];
        listTextComment.forEach((node,index) => {
            const text = node.innerText;
            const author = listAuthorComment[index]?.innerText || "";
            const comment = new Comment(author, text, []);
            comments.push(comment);
        });

        return comments;
    }
}