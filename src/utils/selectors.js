const SELECTORS = {
    instagram: {
        commentText: '//article//h3/following-sibling::div[1]/span[not(ancestor::ul/ancestor::li/ancestor::ul)]', //xpath per ottenere il testo dei commenti
        newCommentsButton: '//li//button[.//*[name() = "circle"]]', //xpath per ottenere il pulsante per caricare nuovi commenti
        commentAuthor: '//article//h3[not(following-sibling::div[1]/img) and not(ancestor::ul/ancestor::li/ancestor::ul)]', //xpath per ottenere gli autori dei commenti (escluse replies)
        newPostButton: '//div[contains(@class, "_aaqg")]/button', //per ora tengo così ma soluzione con la classe non mi convince
        //quello sotto non funziona raggiunta l'ultimo post perchè figlio unico diventa il bottone per tornare indietro e continua avanti-indietro
        postImage: '//article//div/img[@alt]', //xpath per ottenere l'immagine del post (trova tutte le immagini del carosello, la prima è quella visualizzata)
        postCaption: '//article//h1', //xpath per ottenere la caption del post
        postLikesNumber: '//article//section//a/span[text()]/span', //xpath per ottenere il numero dei like al post
        postNumber: '//li/div/span/span', //xpath per ottenere numero di post
        profileLink: '//a//div[@aria-selected ="false"]/span[@role]', //xpath bottone per andare sul profilo
        lastPostLink: '//div[1]/div[1]/a[div[2]]', //xpath per trovare ultimo post pubblicato
        //repliesButton: './/span[.//*[contains(text(), "Rispondi")]]', //xpath per trovare il tasto Rispondi al commento (path relativo)
        repliesTextArea: '//article//textarea',
        publishCommentButton: '//div[preceding-sibling::textarea]/div[@role]', //volendo valido anche '//div/div[@role and text()]'
        boxComment: '//div[h3]'
    }
}

//xpath vecchi con stringhe in italiano:
// '//button[.//*[@aria-label="Avanti"]]' vecchio xpath per trovare pulsante nuovo post (cambiato con uno senza controllo valore aria-label dipendente dalla lingua)
// '//article//button[.//*[@aria-label="Carica altri commenti"]]'
// '//article//img[@alt and not(ancestor::a) and not(contains(@alt, "profilo"))]'
// './/div[contains(text(), "Pubblica")]'
//'//div[count(../div) = 1 or preceding-sibling::div]/button[not(ancestor::ul) and @type]', //xpath per ottenere il pulsante per andare al prossimo post (senza controllo su ul trova anche il pulsante per vedere i taggati e altri, il controllo su @type permette di non selezionare il pulsante per cambiare foto del carosello e quello della foto profilo, il div iniziale ha un controllo e prende solo div che o sono figli unici del div padre o hanno un fratello div precedente, non prende sempre un solo elemento ma il primo è sempre tasto avanti), da problemi perchè quando c'è solo pulsante per tornare indietro trova quello (il find del researcher se l'url che sta cercando non esiste inizierebbe un loop infinito se termino il ciclo indipendentemente da hasNextBtn)


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