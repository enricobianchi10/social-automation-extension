class CommentPublisher {
    
    static async publishRepliesToComment(url_post, author_comment, text_comment, text_replies, social){
        const commentBox = await Researcher.findBoxComment(url_post, author_comment, text_comment, social);
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
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        if(nativeInputValueSetter) console.log("trovato setter textarea value");
        nativeInputValueSetter.call(textarea, text_replies);
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    }
}