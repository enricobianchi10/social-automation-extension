/**
 * @jest-environment jsdom
 */

const CommentPublisher = require('@src/script/publisher/comment/CommentPublisher');
const CommentResearcher = require('@src/script/researcher/comment/CommentResearcher');
global.CommentResearcher = CommentResearcher;
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;
const ChangeDetector = require('@src/script/change-detector/ChangeDetector');
global.ChangeDetector = ChangeDetector;

jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/script/researcher/comment/CommentResearcher');
jest.mock('@src/script/change-detector/ChangeDetector');

// Mock di window.HTMLTextAreaElement.prototype.value (per _setTextComment)
const mockNativeValueSetter = jest.fn();
Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', {
    set: mockNativeValueSetter,
    configurable: true,
});

describe('CommentPublisher', () => {
    const post_url = 'http://example.com/post/123';
    const comment_author = 'This is comment author';
    const comment_text = 'This is comment text';
    const reply_text = 'This is my reply';
    const social = 'instagram';

    let commentPublisher;
    let mockCommentResearcher;

    // Elementi DOM mockati
    let mockReplyButton;
    let mockRepliesTextArea;
    let mockPublishButton;

    beforeAll(() => {
        // Mock dell'Event per dispatchEvent
        global.Event = class extends Event {};
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockCommentResearcher = new CommentResearcher();
        mockCommentResearcher.social = social;
        mockCommentResearcher.find.mockResolvedValue(null); // Di default, il commento non viene trovato

        ChangeDetector.waitForLoading.mockResolvedValue(undefined);

        commentPublisher = new CommentPublisher(mockCommentResearcher);

        // Mock elementi DOM
        mockReplyButton = {
            click: jest.fn(),
            textContent: 'Reply Button'
        };
        mockRepliesTextArea = {
            textContent: '', // Testo iniziale della textarea
            click: jest.fn(),
            dispatchEvent: jest.fn(), // Per simulare l'evento 'input'
        };
        mockPublishButton = {
            click: jest.fn(),
            textContent: 'Publish'
        };

        XPathManager.getOne.mockImplementation((selector) => {
            if (selector === SELECTORS[social].repliesTextArea) {
                return mockRepliesTextArea;
            }
            if (selector === SELECTORS[social].publishCommentButton) {
                return mockPublishButton;
            }
            return null;
        });

        SELECTORS[social] = {
            repliesTextArea: '//textarea', 
            publishCommentButton: '//button' 
        }
    });

    test('should initialize with correct commentResearcher and social', () => {
        expect(commentPublisher.commentResearcher).toBe(mockCommentResearcher);
        expect(commentPublisher.social).toBe(social);
    });

    test('setter should modify parameter correctly', () => {
        const newMockCommentResearcher = new CommentResearcher();
        commentPublisher.commentResearcher = newMockCommentResearcher;
        expect(commentPublisher.commentResearcher).toBe(newMockCommentResearcher);

        commentPublisher.social = 'facebook';
        expect(commentPublisher.social).toBe('facebook');
    });

    //test per setTextComment
    test('setTextComment should set the textarea value and dispatch an input event', () => {
        const textToSet = 'New comment text';

        commentPublisher._setTextComment(textToSet, mockRepliesTextArea);

        // Verifica che il setter nativo del valore sia stato chiamato correttamente
        expect(mockNativeValueSetter).toHaveBeenCalledTimes(1);
        expect(mockNativeValueSetter).toHaveBeenCalledWith(textToSet);

        // Verifica che l'evento 'input' sia stato dispatchato
        expect(mockRepliesTextArea.dispatchEvent).toHaveBeenCalledTimes(1);
        expect(mockRepliesTextArea.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
        expect(mockRepliesTextArea.dispatchEvent.mock.calls[0][0].type).toBe('input');
        expect(mockRepliesTextArea.dispatchEvent.mock.calls[0][0].bubbles).toBe(true);
    });

    //test per publish
    describe('publish', () => {
        let setTextCommentSpy;

        beforeEach(() => {
            // Spia sui metodi privati chiamati da scrapeAll
            setTextCommentSpy = jest.spyOn(commentPublisher, '_setTextComment');
        });

        afterEach(() => {
            setTextCommentSpy.mockRestore();
        });

        test('should successfully publish a reply if comment and elements are found', async () => {
            // Setup: commentResearcher.find restituisce il bottone di risposta
            mockCommentResearcher.find.mockResolvedValue(mockReplyButton);
            mockRepliesTextArea.textContent = ''; //area d testo inziialmente vuota

            await commentPublisher.publish(post_url, comment_author, comment_text, reply_text);

            // Verifiche per la ricerca del commento
            expect(mockCommentResearcher.find).toHaveBeenCalledWith(post_url, comment_author, comment_text);

            expect(mockReplyButton.click).toHaveBeenCalledTimes(1);

            expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);

            // Verifiche per la textarea
            expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].repliesTextArea);
            expect(setTextCommentSpy).toHaveBeenCalledWith(reply_text, mockRepliesTextArea);
            // Verifiche per il bottone di pubblicazione
            expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].publishCommentButton);
            expect(mockPublishButton.click).toHaveBeenCalledTimes(1);
        });

        test('should return if comment is not found', async () => {
            // commentresearcher fnd resttuisce null di default

            await commentPublisher.publish(post_url, comment_author, comment_text, reply_text);

            expect(mockCommentResearcher.find).toHaveBeenCalledWith(post_url, comment_author, comment_text);
            expect(mockReplyButton.click).not.toHaveBeenCalled();
            expect(ChangeDetector.waitForLoading).not.toHaveBeenCalled();
            expect(XPathManager.getOne).not.toHaveBeenCalled();
            expect(mockPublishButton.click).not.toHaveBeenCalled();
        });

        test('should log error if repliesTextArea is not found', async () => {
            mockCommentResearcher.find.mockResolvedValue(mockReplyButton);
            XPathManager.getOne.mockImplementation((selector) => {
                // Simula che la textarea non venga trovata
                if (selector === SELECTORS[social].repliesTextArea) return null;
                if (selector === SELECTORS[social].publishCommentButton) return mockPublishButton;
                return null;
            });

            await commentPublisher.publish(post_url, comment_author, comment_text, reply_text);

            expect(mockReplyButton.click).toHaveBeenCalledTimes(1);
            expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);
            expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].repliesTextArea);
            
            // Non dovrebbe tentare di settare il testo o pubblicare
            expect(mockNativeValueSetter).not.toHaveBeenCalled();
            expect(mockRepliesTextArea.dispatchEvent).not.toHaveBeenCalled();
            expect(mockPublishButton.click).not.toHaveBeenCalled();
        });

        
        test('should log error if publishButton is not found', async () => {
            mockCommentResearcher.find.mockResolvedValue(mockReplyButton);
            XPathManager.getOne.mockImplementation((selector) => {
                // Simula che la textarea non venga trovata
                if (selector === SELECTORS[social].repliesTextArea) return mockRepliesTextArea;
                if (selector === SELECTORS[social].publishCommentButton) return null;
                return null;
            });

            await commentPublisher.publish(post_url, comment_author, comment_text, reply_text);

            expect(mockReplyButton.click).toHaveBeenCalledTimes(1);
            expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);
            expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].repliesTextArea);
            expect(setTextCommentSpy).toHaveBeenCalledWith(reply_text, mockRepliesTextArea);
            expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].publishCommentButton);
            expect(mockPublishButton.click).not.toHaveBeenCalled();
        });
        
        test('should throw an error if commentResearcher.find() rejects', async () => {
            const findCommentError = new Error('Failed to find comment');
            mockCommentResearcher.find.mockRejectedValue(findCommentError);

            await expect(commentPublisher.publish(post_url, comment_author, comment_text, reply_text)).rejects.toThrow(findCommentError);

            expect(mockCommentResearcher.find).toHaveBeenCalledWith(post_url, comment_author, comment_text);
            expect(mockReplyButton.click).not.toHaveBeenCalled();
            expect(ChangeDetector.waitForLoading).not.toHaveBeenCalled();
            expect(XPathManager.getOne).not.toHaveBeenCalled();
            expect(mockPublishButton.click).not.toHaveBeenCalled();
        });

    });

});


