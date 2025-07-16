const SELECTORS = {
    instagram: {
        commentText: '//article//h3/following-sibling::div[1]/span', //xpath per ottenere il testo dei commenti
        newCommentsButton: '//article//button[.//*[@aria-label="Carica altri commenti"]]', //xpath per ottenere il pulsante per caricare nuovi commenti
        commentAuthor: '//article//h3[not(following-sibling::div[1]/img)]', //xpath per ottenere gli autori dei commenti
        newPostButton: '//button[.//*[@aria-label="Avanti"]]', //xpath per ottenere il pulsante per andare al prossimo post
        postImage: '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]', //xpath per ottenere l'immagine del post
        postCaption: '//article//h1', //xpath per ottenere la caption del post
        postLikesNumber: '//article//section//a/span[text()]/span', //xpath per ottenere il numero dei like al post
        postNumber: '//li/div/span/span', //xpath per ottenere numero di post
        profileLink: '//a//div[@aria-selected ="false"]/span[@role]', //xpath bottone per andare sul profilo
        lastPostLink: '//div[1]/div[1]/a/div[2]' //xpath per trovare ultimo post pubblicato
    }
}

//xpath bottone replies '//article//button[.//*[contains(@aria-label, "Visualizza le risposte")]]'
//xpath che prende il testo di tutte le replies '//article//ul/li/ul//div/span[text()]'
//xpath per autori replies '//article//ul/li/ul//div/h3[not(following-sibling::div[1]/img)]'
