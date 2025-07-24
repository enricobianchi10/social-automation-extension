class UrlError extends Error {
    constructor(url){
        super("OOPS! C'è stato un problema nel caricamento del nuovo post probabilmente dovuto ad un errore di connessione," +
            "ricomincia la raccolta dati a partire dall'ultimo post salvato.");
        this._url = url;
    }

    get url(){
        return this._url;
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = UrlError;
}
