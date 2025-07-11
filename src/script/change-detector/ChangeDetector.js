class ChangeDetector {

    static async waitForUrlChanges(oldUrl){
        return new Promise((resolve, reject) => { 

            const interval = setInterval(() => {
                if(location.href !== oldUrl){
                    clearInterval(interval);
                    resolve();
                }
            }, 500) //controlla il cambio url ogni 500 ms e risolve la Promise quando è cambiato 

            setTimeout(() => {
                clearInterval(interval);
                reject(new UrlError(oldUrl));
            }, 10000); //se non carica nuovo url dopo 10 secondi reject 
        }
    )}

    static async waitForCommentLoad(){
        return new Promise((resolve, reject) => {
            let timeout = null;
            const config = { childList: true, subtree: true };
            const observer = new MutationObserver(() => {
                /*for(const mutation of mutationList){
                    if(mutation.addedNodes.length > 0){  
                    observer.disconnect();
                    resolve();
                    }
                }*/
                if(timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, 2000); //se non ci sono cambiamenti per 2 secondi terminato caricamento dei commenti richiesto
            })

            observer.observe(document.body, config);

            setTimeout(() => {
                observer.disconnect();
                reject();
            }, 10000); //se dopo 10 secondi non rileva cambiamenti o non ci sono commenti o problemi di caricaemnto 

        })
    }

    static checkIfCommentLoad(){
        return (XPathManager.getAll('//article//h3/following-sibling::div[1]/span').length > 0); //se lunghezza lista = 0 primi commenti ancora da caricare
    }
}