//ipotizzando di ricevere un dato con i campi: urlPost, author comment, text comment

class Researcher {

    static async findBoxComment(url_post, author_comment, text_comment, social){ //restituisce la comment box del commento che ha autore e testo ricevuti
        let postNavigator = new PostNavigator();
        try {
            postNavigator.findPost(social, url_post);
        }
        catch(err){
            console.log("Ricevuto errore di raggiungimento nuovo post (da navigator)");
            throw err;
        }
        let commentNavigator = new CommentNavigator();
        await commentNavigator.loadAllComments(social); //tutti i commenti caricati
        const commentBoxList = XPathManager.getAll(SELECTORS[social].boxComment);
        if(commentBoxList.length > 0) console.log("Box commenti caricati");
        const commentBoxFiltred = commentBoxList.filter(node => node.querySelector('h3').innerText === author_comment && node.querySelectorAll('span')[2].innerText === text_comment);
        if(commentBoxFiltred.length > 0) {
            console.log("Box del commento trovato");
            return commentBoxFiltred[0];
        }
        else {
            console.log("Box del commento non trovato");
            return false;
        }
    }
}