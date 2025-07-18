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
        lastPostLink: '//div[1]/div[1]/a[div[2]]', //xpath per trovare ultimo post pubblicato
        //repliesButton: './/span[.//*[contains(text(), "Rispondi")]]', //xpath per trovare il tasto Rispondi al commento (path relativo)
        repliesTextArea: '//article//textarea',
        publishCommentButton: './/div[contains(text(), "Pubblica")]',
        boxComment: '//div[h3]'
    }
}

//xpath bottone replies '//article//button[.//*[contains(text(), "Visualizza le risposte")]]' //sembra andare anche '//article//div/button'
//xpath per autori replies '//article//ul/li/ul//div/h3[not(following-sibling::div[1]/img)]'

//xpath per inserimento di un commento
//xpath per trovare i button "Rispondi" '//article//button[.//*[contains(text(), "Rispondi")]]' oppure '//article//span/button/span'
//xpath per area input commento '//article//textarea'
//xpath per pulsante pubblica '//article//section//div[./*[contains(text(), "Pubblica")]]' oppure '//article//section//div[@role][./*[text()]]', con article e section che si possono omettere
//xpath per box commenti '//div[h3]'

//Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value") da il setter nativo del codice (in devtools stringa restituita con nomi semplici e senza location)
//Object.getOwnPropertyDescriptor(textarea, "value") mostra se .value è stata overridata per textarea (in devtools get e set con nomi non value ma anonimi, devtools mostra [[functionlocation]])
//per triggerare il cambiamento del valore di una textarea utilizzare il setter base (fornito dal Browser) e non l'override in React (se faccio textarea.value utilizza il setter overridato) che 
//che non permette di modificare il value della textarea