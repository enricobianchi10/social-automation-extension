const PostScraper = require('@src/script/scraper/post/PostScraper');
const CommentScraper = require('@src/script/scraper/comment/CommentScraper');
global.CommentScrpaer = CommentScraper;
const CommentNavigator = require('@src/script/navigator/comment/CommentNavigator');
global.CommentNavigator = CommentNavigator;
const PostNavigator = require('@src/script/navigator/post/PostNavigator');
global.PostNavigator = PostNavigator;
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
const Post = require('@src/model/Post');
global.Post = Post;

jest.mock('@src/script/navigator/post/PostNavigator');
jest.mock('@src/script/scraper/comment/CommentScraper');
jest.mock('@src/script/navigator/comment/CommentNavigator');
jest.mock('@src/model/Comment');
jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/model/Post');

describe('PostScraper', () => {
    const social = 'instagram';
    const init_url = 'http://instagram.com/p/first_post/';

    let postScraper;
    let mockPostNavigator; 
    let mockCommentScraper; 
    let consoleLogSpy;

    beforeAll(() => {
        // Spia su console.log per intercettare i messaggi
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        // Ripristina console.log dopo tutti i test
        consoleLogSpy.mockRestore();
    });

    beforeEach(() => {
        // Pulisci tutti i mock e spia prima di ogni test per garantire l'isolamento
        jest.clearAllMocks();

        // Reimposta window.location.href per ogni test
        Object.defineProperty(global, 'window', {
            value: {
                location: {
                    href: init_url, // Inizializza l'href con il valore corrente
                    // Definizione del getter/setter per href
                    get: jest.fn(() => currentMockUrl),
                    set: jest.fn((newUrl) => { currentMockUrl = newUrl; }),
                    assign: jest.fn(),
                    replace: jest.fn(),
                    reload: jest.fn(),
                },
            },
            writable: true,
            configurable: true,
        });

        // Mock di PostNavigator (istanza di un costruttore mockato)
        mockPostNavigator = new PostNavigator(); // Crea un'istanza mockata del PostNavigator
        mockPostNavigator.social = social;
        mockPostNavigator.next.mockResolvedValue(undefined); // next() del PostNavigator si risolve con successo

        // Mock di CommentScraper (istanza di un costruttore mockato)
        mockCommentScraper = new CommentScraper(); // Crea un'istanza mockata del CommentScraper
        mockCommentScraper.social = social;
        mockCommentScraper.scrapeAll.mockResolvedValue([]); // Default scrapeAll() di CommentScraper restituisce array vuoto di commenti

        // Mock di XPathManager
        XPathManager.getOne.mockReturnValue(null); // Default nessun elemento trovato (postNumber, img, caption, likes)

        // Mock della classe Post (costruttore)
        Post.mockImplementation((number, url, imgSrc, caption, likes, comments) => 
            ({ number, url, imgSrc, caption, likes, comments }));
        
        SELECTORS[social] = {
            postNumber: 'mockedPostNumberSelector',
            postImage: 'mockedPostImageSelector',
            postCaption: 'mockedPostCaptionSelector',
            postLikesNumber: 'mockedPostLikesNumberSelector',
        };

        // Inizializza PostScraper con le dipendenze mockate
        postScraper = new PostScraper(mockPostNavigator, mockCommentScraper);
    });

    test('should initialize with correct postNavigator, commentScraper, and social', () => {
        expect(postScraper.postNavigator).toBe(mockPostNavigator);
        expect(postScraper.commentScraper).toBe(mockCommentScraper);
        expect(postScraper.social).toBe(social);
    });

    test('setters should modify parameters correctly', () => {
        const newMockPostNavigator = new PostNavigator();
        newMockPostNavigator.social = 'facebook';
        postScraper.postNavigator = newMockPostNavigator;
        expect(postScraper.postNavigator).toBe(newMockPostNavigator);
        const newMockCommentScraper = new CommentScraper();
        newMockCommentScraper.social = 'facebook';
        postScraper.commentScraper = newMockCommentScraper;
        expect(postScraper.commentScraper).toBe(newMockCommentScraper);
        postScraper.social = 'facebook';
        expect(postScraper.social).toBe('facebook');
    });

    //test per _getPostNumber()

    test('getPostNumber should return post number if found', () => {
        XPathManager.getOne.mockReturnValue({ textContent: '123' });
        const postNumber = postScraper._getPostNumber();
        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].postNumber);
        expect(postNumber).toBe(123);
    });

    test('getPostNumber should return 0 and log if post number not found', () => {
        XPathManager.getOne.mockReturnValue(null);
        const postNumber = postScraper._getPostNumber();
        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].postNumber);
        expect(postNumber).toBe(0);
        expect(consoleLogSpy).toHaveBeenCalledWith("Numero di post non trovato");
    });

    test('getPostNumber should return 0 and log if textContent is empty', () => {
        XPathManager.getOne.mockReturnValue({ textContent: '' });
        const postNumber = postScraper._getPostNumber();
        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].postNumber);
        expect(postNumber).toBe(0);
    });

    //test per _scrape()

     test('scrape() should scrape post details and comments', async () => {
        const mockPostNumber = 10;
        const mockPostImgNode = { src: 'http://example.com/img.jpg' };
        const mockPostCaptionNode = { innerText: 'Test caption' };
        const mockPostLikesNode = { innerText: '1,234' };
        const mockComments = [{ author: 'user1', text: 'comment1' }];

        // Configura XPathManager.getOne per restituire i nodi
        XPathManager.getOne
            .mockImplementation((selector) => {
                if (selector === SELECTORS[social].postImage) return mockPostImgNode;
                if (selector === SELECTORS[social].postCaption) return mockPostCaptionNode;
                if (selector === SELECTORS[social].postLikesNumber) return mockPostLikesNode;
                return null;
            });
        
        mockCommentScraper.scrapeAll.mockResolvedValue(mockComments); // CommentScraper restituisce commenti

        const post = await postScraper._scrape(mockPostNumber);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].postImage);
        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].postCaption);
        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].postLikesNumber);
        expect(mockCommentScraper.scrapeAll).toHaveBeenCalledTimes(1);
        expect(Post).toHaveBeenCalledTimes(1);
        expect(Post).toHaveBeenCalledWith(
            mockPostNumber,
            init_url,
            mockPostImgNode.src,
            mockPostCaptionNode.innerText,
            mockPostLikesNode.innerText,
            mockComments
        );
        expect(post.number).toBe(mockPostNumber);
        expect(post.url).toBe(init_url);
        expect(post.comments).toEqual(mockComments);
    });

    test('scrape() should handle missing image (video) and default caption/likes', async () => {
        const mockPostNumber = 5;
        XPathManager.getOne.mockReturnValue(null); // Nessuna immagine, caption, likes trovati
        mockCommentScraper.scrapeAll.mockResolvedValue([]); // Nessun commento

        const post = await postScraper._scrape(mockPostNumber);

        expect(post.imgSrc).toBe("Video");
        expect(post.caption).toBe("Nessuna caption");
        expect(post.likes).toBe("0");
        expect(Post).toHaveBeenCalledWith(mockPostNumber, init_url, "Video", "Nessuna caption", "0", []);
    });

    test('scrape() should pass through scrapeAll error from commentScraper', async () => {
        const mockError = new Error('Comment scraping failed');
        mockCommentScraper.scrapeAll.mockRejectedValue(mockError);

        await expect(postScraper._scrape(1)).rejects.toThrow(mockError);
        expect(mockCommentScraper.scrapeAll).toHaveBeenCalledTimes(1);
        expect(Post).not.toHaveBeenCalled(); // Non dovrebbe essere chiamato se scrapeAll fallisce
    });

    describe('scrapeAll', () => {
        let getPostNumberSpy;
        let scrapePrivateSpy;

        beforeEach(() => {
            // Spia sui metodi privati chiamati da scrapeAll
            getPostNumberSpy = jest.spyOn(postScraper, '_getPostNumber');
            scrapePrivateSpy = jest.spyOn(postScraper, '_scrape');

            // Configurazione default per i mock usati in scrapeAll
            getPostNumberSpy.mockReturnValue(3); // 3 post
            scrapePrivateSpy.mockResolvedValue({}); // scrape() restituisce un Post vuoto di default

            // Resetta lo stato di hasNextBtn e next per postNavigator
            mockPostNavigator.hasNextBtn = true;
            mockPostNavigator.next.mockResolvedValue(undefined);
            
            // Resetta scrapeAll per commentScraper
            mockCommentScraper.scrapeAll.mockResolvedValue([]);
        });

        afterEach(() => {
            getPostNumberSpy.mockRestore();
            scrapePrivateSpy.mockRestore();
        });

        test('should scrape all posts by iterating with postNavigator', async () => {
            
            // Configura _scrape per restituire un Post con il numero corretto
            let scrapeCallCount = 0;
            scrapePrivateSpy.mockImplementation(async (num) => {
                scrapeCallCount++;
                if (scrapeCallCount === 3) {
                    // Dopo il terzo scrape, il postNavigator dovrebbe indicare la fine
                    mockPostNavigator.hasNextBtn = false;
                }
                return { number: num, url: `http://post/${num}` }; // Mock semplificato del Post
            });

            const posts = await postScraper.scrapeAll();

            expect(getPostNumberSpy).toHaveBeenCalledTimes(1);
            
            expect(scrapePrivateSpy).toHaveBeenCalledTimes(3); // Chiamato 3 volte lo scrape singolo
            expect(scrapePrivateSpy).toHaveBeenCalledWith(3);
            expect(scrapePrivateSpy).toHaveBeenCalledWith(2);
            expect(scrapePrivateSpy).toHaveBeenCalledWith(1);

            expect(mockPostNavigator.next).toHaveBeenCalledTimes(3); // Chiamato le prime due volte poi arriva all'ultimo post e viene chiamato l'ultima volte dove setta flag a false
            expect(mockPostNavigator.hasNextBtn).toBe(false); // Alla fine deve essere falso
            expect(posts.length).toBe(3);
            expect(posts[0].number).toBe(3);
            expect(posts[1].number).toBe(2);
            expect(posts[2].number).toBe(1);
        });

        test('should rethrow error if postNavigator.next() rejects', async () => {
            getPostNumberSpy.mockReturnValue(2); 
            scrapePrivateSpy.mockResolvedValue({}); // _scrape risolve

            const navigationError = new Error('Failed to navigate to next post');
            mockPostNavigator.next.mockRejectedValueOnce(navigationError); // Fallisce al primo tentativo

            await expect(postScraper.scrapeAll()).rejects.toThrow(navigationError);

            expect(getPostNumberSpy).toHaveBeenCalledTimes(1);
            expect(scrapePrivateSpy).toHaveBeenCalledTimes(1); // Scrape del primo post
            expect(mockPostNavigator.next).toHaveBeenCalledTimes(1); // Tentativo di navigazione fallito
        });
    });
});





