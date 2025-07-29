class InstagramPageNavigator {

    static async openLastPost(social){
        const urlPage = window.location.href;
        const postLink = XPathManager.getOne(SELECTORS[social].lastPostLink);
        if(!postLink){
            console.log("Nessun link per aprire l'ultimo post trovato");
            return;
        }
        else {
            console.log("Link per aprire ultimo post trovato");
            if(!isSamePost(postLink.href, urlPage)){
                postLink.click();
                try {
                    await ChangeDetector.waitForUrlChanges(urlPage);
                    console.log("Ultimo post caricato");
                }
                catch (err) {
                    console.log("Errore nel caricamento dell'ultimo post");
                    throw err;
                }
            }
            else console.log("Sei già nella pagina dell'ultimo post");
        }
    }

    static async goToProfile(social){
        const urlPage = window.location.href;
        const profileLink = XPathManager.getOne(SELECTORS[social].profileLink);
        if(!profileLink){
            console.log("Link per andare sul profilo non trovato");
            return;
        }
        else {
            console.log("Link per andare sul profilo trovato!");
            profileLink.click();
            try {
                await ChangeDetector.waitForUrlChanges(urlPage);
                if(!ChangeDetector.checkIfPostLoad(social)){
                    await ChangeDetector.waitForLoading();
                }
                console.log("Pagina del profilo caricata e post caricati");
            }
            catch (err) {
                console.log("Errore nel caricamento della pagina del profilo");
                throw err;
            }
        }
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = InstagramPageNavigator;
}