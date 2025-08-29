class InstagramPageNavigator {

    static async openLastPost(social){
        const urlPage = window.location.href;
        const postLink = XPathManager.getOne(SELECTORS[social].lastPostLink);
        if(!postLink){
            return;
        }
        else {
            if(!isSamePost(postLink.href, urlPage)){
                postLink.click();
                await ChangeDetector.waitForUrlChanges(urlPage);
            }
            return;
        }
    }

    static async goToProfile(social){
        const urlPage = window.location.href;
        const profileLink = XPathManager.getOne(SELECTORS[social].profileLink);
        if(!profileLink){
            return;
        }
        else {
            profileLink.click();
            await ChangeDetector.waitForUrlChanges(urlPage);
            if(!ChangeDetector.checkIfPostLoad(social)){
                await ChangeDetector.waitForLoading();
            }
        }
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = InstagramPageNavigator;
}