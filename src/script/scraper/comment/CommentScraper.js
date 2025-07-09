//xpath per trovare autori ai commenti '//article//h3', migliorata per escludere autori di commenti con gif, '//article//h3[not(following-sibling::div[1]/img)]'
//xapth per trovare testi dei commenti '//article//h3/following-sibling::div[1]/span' (funziona anche senza article)
//testi commenti migliorato per non prendere replies '//article//h3/following-sibling::div[1]/span[not(ancestor::ul/ancestor::li/ancestor::ul)]'
//autori commenti migliorato per non prendere replies '//article//h3[not(following-sibling::div[1]/img) and not(ancestor::ul/ancestor::li/ancestor::ul)]'

class CommentScraper {
    static async scrapeComment(){
        console.log("Inizio scraping dei commenti");
        const listTextComment = XPathManager.getAll('//article//h3/following-sibling::div[1]/span');
        const listAuthorComment = XPathManager.getAll('//article//h3[not(following-sibling::div[1]/img)]');
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

//problema che per ora prendono anche le replies