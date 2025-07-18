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
        const commentBoxFiltred = commentBoxList.filter(node => node.querySelector('h3').innerText === author_comment && node.querySelectorAll('span')[2].innerText === text_comment);
        if(commentBoxFiltred) {
            console.log("Box del commento trovato");
            return commentBoxFiltred[0];
        }
        else return false;
    }
}