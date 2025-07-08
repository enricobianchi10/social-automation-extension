//selettore lista span con testo dei commenti 'div.xt0psk2 > span[dir]'
//selettore lista con autori commenti '._a9ym > .x11njtxf .x568u83'
//selettore lista autori risposte ad un commento '._a9ye .x568u83'
//selettore lista con testo delle risposte ad un commento '._a9ye ._aade'
//selettore xpath per autore non commento gif //h3[not(following-sibling::div[.//img])]//a[string-length(normalize-space(text())) > 0]

class CommentScraper {
    static async scrapeComment(){
        console.log("Inizio scraping dei commenti");
        // per facebook ma bannato const post = document.querySelector('img[data-visualcompletion]');
        const listTextComment = document.querySelectorAll("div.xt0psk2 > span[dir]");
        // per facebook ma bannato const postCaption = document.querySelector(".x1g2khh7 .xzsf02u").innerText; selettore per caption del post
        const listAuthorComment = document.querySelectorAll("._a9ym > .x11njtxf .x568u83");
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

//problema che se il commento non ha testo ma un img si "sballa" tutto 