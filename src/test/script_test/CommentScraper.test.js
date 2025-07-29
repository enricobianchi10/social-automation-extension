const CommentScraper = require('@src/script/scraper/comment/CommentScraper');
const CommentNavigator = require('@src/script/navigator/comment/CommentNavigator');
global.CommentNavigator = CommentNavigator;
const ChangeDetector = require('@src/script/change-detector/ChangeDetector');
global.ChangeDetector = ChangeDetector;
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;
const UrlError = require('@src/errors/errors');
global.UrlError = UrlError;
const Comment = require('@src/model/Comment');
global.Comment = Comment;

jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/script/navigator/comment/CommentNavigator');
jest.mock('@src/model/Comment');

describe('CommentScraper', () => {
    const social = 'instagram';
    let mockCommentNavigator;
    let commentScraper;
    let consoleLogSpy;

    beforeAll(() => {
        // Spia su console.log per verificare i messaggi
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        // Ripristina console.log dopo tutti i test
        consoleLogSpy.mockRestore();
    });

    beforeEach(() => {
        // Pulisci tutti i mock prima di ogni test per garantire l'isolamento
        jest.clearAllMocks();

        XPathManager.getAll.mockReturnValue([]); // Default: nessun commento trovato

        // Mock dei SELECTORS
        SELECTORS[social] = {
            commentText: 'mockedCommentTextSelector',
            commentAuthor: 'mockedCommentAuthorSelector',
        };

        // Inizializza il CommentScraper con il mock del CommentNavigator
        mockCommentNavigator = new CommentNavigator();
        mockCommentNavigator.social = social;
        mockCommentNavigator.next.mockResolvedValue(undefined);
        commentScraper = new CommentScraper(mockCommentNavigator);
        //mock dei commenti
        Comment.mockImplementation((author, text) => ({ author, text }));
    });

    test('should initialize with correct commentNavigator and social', () => {
        expect(commentScraper.commentNavigator).toBe(mockCommentNavigator);
        expect(commentScraper.social).toBe(social);
    });

    test('setters should modify parameters correctly', () => {
        const newMockNavigator = new CommentNavigator('facebook');
        commentScraper.commentNavigator = newMockNavigator;
        expect(commentScraper.commentNavigator).toBe(newMockNavigator);
        expect(commentScraper.social).toBe(social); // Social non dovrebbe cambiare se non aggiornato esplicitamente
        commentScraper.social = 'twitter';
        expect(commentScraper.social).toBe('twitter');
    });

    test('scrapeAll should call commentNavigator.next()', async () => {
        await commentScraper.scrapeAll();
        expect(commentScraper.commentNavigator.next).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith("Inizio scraping dei commenti");
    });

    test('should return an empty array if no comments are found', async () => {
        //mock getAll per restituire array vuoto in beforeEach
        const comments = await commentScraper.scrapeAll();

        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].commentText);
        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].commentAuthor);
        expect(comments).toEqual([]);
        expect(Comment).not.toHaveBeenCalled();
    });

    test('should return comments with authors and text', async () => {
        const mockTextNodes = [
            { innerText: 'Primo commento' },
            { innerText: 'Secondo commento' },
        ];
        const mockAuthorNodes = [
            { innerText: 'Autore1' },
            { innerText: 'Autore2' },
        ];

        // Configura XPathManager.getAll per restituire i nodi mockati
        XPathManager.getAll
            .mockImplementation((selector) => {
                if (selector === SELECTORS[social].commentText) {
                    return mockTextNodes;
                }
                if (selector === SELECTORS[social].commentAuthor) {
                    return mockAuthorNodes;
                }
                return [];
            });
        
        const comments = await commentScraper.scrapeAll();

        expect(XPathManager.getAll).toHaveBeenCalledTimes(2);
        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].commentText);
        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS[social].commentAuthor);
        expect(comments.length).toBe(2);
        expect(comments[0]).toEqual({ author: 'Autore1', text: 'Primo commento' });
        expect(comments[1]).toEqual({ author: 'Autore2', text: 'Secondo commento' });
        expect(Comment).toHaveBeenCalledTimes(2);
        expect(Comment).toHaveBeenCalledWith('Autore1', 'Primo commento');
        expect(Comment).toHaveBeenCalledWith('Autore2', 'Secondo commento');
    });

    test('should handle missing authors', async () => {
        const mockTextNodes = [
            { innerText: 'Solo testo' },
        ];
        const mockAuthorNodes = [];

        XPathManager.getAll
            .mockImplementation((selector) => {
                if (selector === SELECTORS[social].commentText) {
                    return mockTextNodes;
                }
                if (selector === SELECTORS[social].commentAuthor) {
                    return mockAuthorNodes;
                }
                return [];
            });

        const comments = await commentScraper.scrapeAll();

        expect(comments.length).toBe(1);
        expect(comments[0]).toEqual({ author: 'Autore non trovato', text: 'Solo testo' });
        expect(Comment).toHaveBeenCalledTimes(1);
        expect(Comment).toHaveBeenCalledWith('Autore non trovato', 'Solo testo');
        expect(consoleLogSpy).toHaveBeenCalledWith("Trovata lista testi commenti di lunghezza:", 1);
        expect(consoleLogSpy).toHaveBeenCalledWith("Trovata lista autori commenti di lunghezza:", 0);
    });

})

