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

    static async waitForLoading(){
        return new Promise((resolve, reject) => {
            let timeout = null;
            const config = { childList: true, subtree: true };
            const observer = new MutationObserver(() => {
                if(timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, 2000); //se non ci sono cambiamenti per 2 secondi terminato caricamento dei commenti/post richiesto
            })

            observer.observe(document.body, config);

            setTimeout(() => {
                observer.disconnect();
                reject();
            }, 10000); //se dopo 10 secondi non rileva cambiamenti o non ci sono commenti o problemi di caricaemnto 
        })
    }

    static checkIfCommentLoad(social){
        return (XPathManager.getAll(SELECTORS[social].commentText).length > 0); //se lunghezza lista = 0 primi commenti ancora da caricare
    }

    static checkIfPostLoad(social){
        return Boolean(XPathManager.getOne(SELECTORS[social].lastPostLink));
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = ChangeDetector;
}