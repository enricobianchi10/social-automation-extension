class CommentPublisher {
    
    static async publishRepliesToComment(url_post, author_comment, text_comment, text_replies, social){
        let commentBox;
        try {
            commentBox = await Researcher.findBoxComment(url_post, author_comment, text_comment, social);
            if(!commentBox){
                console.log("Commento non trovato");
                return;
            }
        }
        catch (err) {
            console.log("ricevuto errore di raggiungimento nuovo post (da researcher)");
            throw err;
        }
        const repliesButton = commentBox.querySelector('button');
        if(!repliesButton) console.log("Pulsante per rispondere ad un commento non trovato");
        else console.log("Pulsante per rispondere ad un commento trovato!");
        repliesButton.click();
        await ChangeDetector.waitForLoading();
        const repliesTextArea = XPathManager.getOne(SELECTORS[social].repliesTextArea);
        if(!repliesTextArea) console.log("Area di testo per la replies non trovata");
        else console.log("Area di testo per la replies trovata!");
        const publishButton = XPathManager.getOne(SELECTORS[social].publishCommentButton);
        if(!publishButton) console.log("Pulsante per pubblicare replies non trovato");
        else console.log("Pulsante per pubblicare replies trovato");
        text_replies = repliesTextArea.textContent + text_replies;
        this.#setTextComment(text_replies, repliesTextArea);
        console.log("settato testo della replies");
        publishButton.click();
    }

    static #setTextComment(text_replies, textarea){
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        if(nativeValueSetter) console.log("trovato setter textarea value");
        nativeValueSetter.call(textarea, text_replies);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
}