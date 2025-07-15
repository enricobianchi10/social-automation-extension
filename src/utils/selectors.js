const SELECTORS = {
    instagram: {
        commentText: '//article//h3/following-sibling::div[1]/span', //xpath per ottenere il testo dei commenti
        newCommentsButton: '//article//button[.//*[@aria-label="Carica altri commenti"]]', //xpath per ottenere il pulsante per caricare nuovi commenti
        commentAuthor: '//article//h3[not(following-sibling::div[1]/img)]', //xpath per ottenere gli autori dei commenti
        newPostButton: '//button[.//*[@aria-label="Avanti"]]', //xpath per ottenere il pulsante per andare al prossimo post
        postImage: '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]', //xpath per ottenere l'immagine del post
        postCaption: '//article//h1', //xpath per ottenere la caption del post
        postLikesNumber: '//article//section//a/span[text()]/span' //xpath per ottenere il numero dei like al post
    }
}