class CommentPublisher {

    constructor(comment_researcher){
        this._commentResearcher = comment_researcher;
        this._social = comment_researcher.social;
    }

    get commentResearcher(){
        return this._commentResearcher;
    }

    set commentResearcher(comment_researcher){
        this._commentResearcher = comment_researcher;
    }

    get social(){
        return this._social;
    }

    set social(social){
        this._social = social;
    }
    
    async publish(url_post, author_comment, text_comment, text_replies){
        let replyBtn;
        try {
            replyBtn = await this.commentResearcher.find(url_post, author_comment, text_comment);
            if(!replyBtn){
                console.log("Commento non trovato");
                return;
            }
        }
        catch (err) {
            console.log("ricevuto errore di raggiungimento nuovo post (da researcher)");
            throw err;
        }

        replyBtn.click();
        await ChangeDetector.waitForLoading();
        const repliesTextArea = XPathManager.getOne(SELECTORS[this.social].repliesTextArea);
        if(!repliesTextArea) console.log("Area di testo per la replies non trovata");
        else console.log("Area di testo per la replies trovata!");
        text_replies = repliesTextArea.textContent + text_replies;
        this.#setTextComment(text_replies, repliesTextArea);
        console.log("settato testo della replies");
        const publishButton = XPathManager.getOne(SELECTORS[this.social].publishCommentButton);
        if(!publishButton) console.log("Pulsante per pubblicare replies non trovato");
        else console.log("Pulsante per pubblicare replies trovato");
        publishButton.click();
    }

    #setTextComment(text_replies, textarea){
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        if(nativeValueSetter) console.log("trovato setter textarea value");
        nativeValueSetter.call(textarea, text_replies);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
}