/**
 * @jest-environment jsdom
 */

const CommentResearcher = require('@src/script/researcher/comment/CommentResearcher');
const PostResearcher = require('@src/script/researcher/post/PostResearcher');
global.PostResearcher = PostResearcher;
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const CommentNavigator = require('@src/script/navigator/comment/CommentNavigator');
global.CommentNavigator = CommentNavigator;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;

jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/script/navigator/comment/CommentNavigator');
jest.mock('@src/script/researcher/post/PostResearcher');

describe('CommentResearcher', () => {
    const post_url = 'http://example.com/post/123';
    const comment_author = 'test_author';
    const comment_text = 'This is a test comment.';
    const social = 'instagram';

    let commentResearcher;
    let mockPostResearcher;
    let mockCommentNavigator;
    let consoleLogSpy;

    beforeAll(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleLogSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockPostResearcher = new PostResearcher();
        mockPostResearcher.find.mockResolvedValue(undefined); 
        mockPostResearcher.postNavigator = {
            postUrl: post_url 
        };

        mockCommentNavigator = new CommentNavigator(); 
        mockCommentNavigator.social = social;
        mockCommentNavigator.next.mockResolvedValue(undefined); 

        commentResearcher = new CommentResearcher(mockPostResearcher, mockCommentNavigator);

        XPathManager.getAll.mockReturnValue([]); // Di default, nessuna casella di commento trovata
        SELECTORS[social] = {
            boxComment: '//div[@role="dialog"]//div[contains(@class, "x1ja2u2z")]' // Esempio di selettore
        };
    });
    
    test('should initialize with correct postResearcher, commentNavigator, and social', () => {
        expect(commentResearcher.postResearcher).toBe(mockPostResearcher);
        expect(commentResearcher.commentNavigator).toBe(mockCommentNavigator);
        expect(commentResearcher.social).toBe(social);
    });

    test('setter should modify parameter correctly', () => {
        const newMockPostResearcher = new PostResearcher();
        commentResearcher.postResearcher = newMockPostResearcher;
        expect(commentResearcher.postResearcher).toBe(newMockPostResearcher);

        const newMockCommentNavigator = new CommentNavigator();
        commentResearcher.commentNavigator = newMockCommentNavigator;
        expect(commentResearcher.commentNavigator).toBe(newMockCommentNavigator);

        commentResearcher.social = 'facebook';
        expect(commentResearcher.social).toBe('facebook');
    });

    test('find() should return the reply button if comment is found', async () => {
        // Simula il DOM element per un commento
        const mockReplyButton = document.createElement('button');
        mockReplyButton.textContent = 'Reply';

        const mockCommentBox = {
            querySelector: jest.fn((selector) => {
                if (selector === 'h3') {
                    return { innerText: comment_author };
                }
                if (selector === 'button') {
                    return mockReplyButton;
                }
                return null;
            }),
            querySelectorAll: jest.fn((selector) => {
                if (selector === 'span') {
                    // span[2] è il testo del commento
                    return [{}, {}, { innerText: comment_text }]; 
                }
                return [];
            }),
        };

        // Configura XPathManager per restituire la casella di commento mockata
        XPathManager.getAll.mockReturnValue([mockCommentBox]);

        const result = await commentResearcher.find(post_url, comment_author, comment_text);

        // Verifiche
        expect(mockPostResearcher.find).toHaveBeenCalledWith(post_url);
        expect(mockCommentNavigator.next).toHaveBeenCalledTimes(1);
        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].boxComment);
        
        // Verifica che il filtro abbia funzionato accedendo alle proprietà corrette
        expect(mockCommentBox.querySelector).toHaveBeenCalledWith('h3');
        expect(mockCommentBox.querySelectorAll).toHaveBeenCalledWith('span');
        
        expect(result).toBe(mockReplyButton);
    });

    test('find() should return false if post is not found by PostResearcher', async () => {
        // Simula che il PostResearcher non riesca a trovare il post (il postUrl non corrisponde)
        mockPostResearcher.postNavigator.postUrl = 'http://example.com/other_url'; // URL non corrispondente

        const result = await commentResearcher.find(post_url, comment_author, comment_text);

        expect(mockPostResearcher.find).toHaveBeenCalledWith(post_url);
        expect(mockCommentNavigator.next).not.toHaveBeenCalled(); // next() non dovrebbe essere chiamato
        expect(XPathManager.getAll).not.toHaveBeenCalled(); // XPathManager non dovrebbe essere chiamato
        
        expect(result).toBe(false);    
    });

    test('find() should return false if comment is not found in the comment list', async () => {
        // Simula un commento che non corrisponde (autore sbagliato)
        const mockCommentBox1 = {
            querySelector: jest.fn((s) => ({ innerText: 'wrong_author' })),
            querySelectorAll: jest.fn((s) => [{}, {}, { innerText: comment_text }]),
        };
        // Simula un commento che non corrisponde (testo sbagliato)
        const mockCommentBox2 = {
            querySelector: jest.fn((s) => ({ innerText: comment_author })),
            querySelectorAll: jest.fn((s) => [{}, {}, { innerText: 'wrong_text' }]),
        };
        
        XPathManager.getAll.mockReturnValue([mockCommentBox1, mockCommentBox2]);

        const result = await commentResearcher.find(post_url, comment_author, comment_text);

        expect(mockPostResearcher.find).toHaveBeenCalledWith(post_url);
        expect(mockCommentNavigator.next).toHaveBeenCalledTimes(1);
        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].boxComment);
        
        expect(result).toBe(false);
    });

    test('should return false if no comment boxes are found', async () => {

        const result = await commentResearcher.find(post_url, comment_author, comment_text);

        expect(mockPostResearcher.find).toHaveBeenCalledWith(post_url);
        expect(mockCommentNavigator.next).toHaveBeenCalledTimes(1);
        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].boxComment);
        
        expect(result).toBe(false);
    });

    test('find() should throw an error if postResearcher.find() rejects', async () => {
        const findPostError = new Error('Failed to find post');
        mockPostResearcher.find.mockRejectedValue(findPostError);

        await expect(commentResearcher.find(post_url, comment_author, comment_text)).rejects.toThrow(findPostError);

        expect(mockPostResearcher.find).toHaveBeenCalledWith(post_url);
        expect(mockCommentNavigator.next).not.toHaveBeenCalled(); // Non dovrebbe chiamare next()
        expect(XPathManager.getAll).not.toHaveBeenCalled(); // Non dovrebbe chiamare XPathManager
    });

})

