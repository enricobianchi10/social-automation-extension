const PostResearcher = require('@src/script/researcher/post/PostResearcher');
const PostNavigator = require('@src/script/navigator/post/PostNavigator');
global.PostNavigator = PostNavigator;
const utils = require('@src/utils/utils');
global.isSamePost = utils.isSamePost;

jest.mock('@src/script/navigator/post/PostNavigator');
jest.mock('@src/utils/utils', () => ({
    ...jest.requireActual('@src/utils/utils'), //Mantiene le implementazioni reali di tutte le altre esportazioni
    isSamePost: jest.fn(jest.requireActual('@src/utils/utils').isSamePost), //mock funzione isSamePost
}));

describe('PostResearcher', () => {
    const social = 'instagram';
    const init_url = 'http://instagram.com/p/initial_post/';
    const target_url = 'http://instagram.com/p/target_post/';
    const next_url = 'http://instagram.com/p/next_post/';

    let postResearcher;
    let mockPostNavigator;
    let currentMockUrl;

    beforeEach(() => {
        jest.clearAllMocks();

        currentMockUrl = init_url;
        Object.defineProperty(global, 'window', {
            value: {
                location: {
                    href: currentMockUrl,
                    get: jest.fn(() => currentMockUrl),
                    set: jest.fn((newUrl) => { currentMockUrl = newUrl; }),
                },
            },
            writable: true,
            configurable: true,
        });

        mockPostNavigator = new PostNavigator(); // Crea un'istanza mockata del PostNavigator
        mockPostNavigator.social = social;
        mockPostNavigator.hasNextBtn = true;
        mockPostNavigator.next.mockResolvedValue(undefined);

        postResearcher = new PostResearcher(mockPostNavigator);
        isSamePost.mockImplementation((url1, url2) => url1 === url2);
    })

    test('should initialize with correct postNavigator and social', () => {
        expect(postResearcher.postNavigator).toBe(mockPostNavigator);
        expect(postResearcher.social).toBe(social);
    });

    test('setters should modify parameters correctly', () => {
        const newMockPostNavigator = {
            social: 'facebook',
            hasNextBtn: false,
            next: jest.fn(),
        };
        postResearcher.postNavigator = newMockPostNavigator;
        expect(postResearcher.postNavigator).toBe(newMockPostNavigator);
        postResearcher.social = 'facebook';
        expect(postResearcher.social).toBe('facebook');
    });

    test('find() should navigate to the target post', async () => {

        // Simula due chiamate a next(), ognuna delle quali aggiorna currentMockUrl.
        mockPostNavigator.next
        .mockImplementationOnce(async () => {
            currentMockUrl = next_url;
            window.location.href = currentMockUrl;
        })
        .mockImplementationOnce(async () => {
            currentMockUrl = target_url;
            window.location.href = currentMockUrl;
        });

        await postResearcher.find(target_url);

        expect(postResearcher.postNavigator.next).toHaveBeenCalledTimes(2);
        expect(isSamePost).toHaveBeenCalledTimes(3); //chiamato per ogni esecuzione di next() + prima volta 
        expect(window.location.href).toBe(target_url);
        expect(mockPostNavigator.hasNextBtn).toBe(true);
    });

    test('should throw an error if postNavigator.next() rejects', async () => {
        const navigationError = new Error('Navigation failed!');
        mockPostNavigator.next.mockRejectedValueOnce(navigationError);
    
        await expect(postResearcher.find(target_url)).rejects.toThrow(navigationError);
    
        expect(mockPostNavigator.next).toHaveBeenCalledTimes(1);
        expect(isSamePost).toHaveBeenCalledTimes(1); // Chiamato prima del tentativo di next()
    });

})
