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
        replyBtn = await this.commentResearcher.find(url_post, author_comment, text_comment);
        if(!replyBtn){
            return;
        }
        replyBtn.click();
        await ChangeDetector.waitForLoading();
        const repliesTextArea = XPathManager.getOne(SELECTORS[this.social].repliesTextArea);
        if(!repliesTextArea) {
            return;
        }
        text_replies = repliesTextArea.textContent + text_replies;
        this._setTextComment(text_replies, repliesTextArea);
        const publishButton = XPathManager.getOne(SELECTORS[this.social].publishCommentButton);
        if(!publishButton) {
            return;
        }
        publishButton.click();
    }

    _setTextComment(text_replies, textarea){
        const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeValueSetter.call(textarea, text_replies);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CommentPublisher;
}