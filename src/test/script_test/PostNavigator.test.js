const PostNavigator = require('@src/script/navigator/post/PostNavigator');
const ChangeDetector = require('@src/script/change-detector/ChangeDetector');
global.ChangeDetector = ChangeDetector;
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;
const UrlError = require('@src/errors/errors');
global.UrlError = UrlError;

jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/script/change-detector/ChangeDetector');

describe('PostNavigator', () => {
    let navigator;
    const init_url = 'http://example.com/post/1';
    const next_url = 'http://example.com/post/2';
    const social = 'instagram';
    let consoleLogSpy;

    const mockLocation = {
        href: init_url, // URL iniziale di default
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
        // Aggiungi altre proprietà o metodi di 'location' se il tuo codice li usa
        pathname: '/',
        search: '',
        hash: ''
    };

    beforeAll(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleLogSpy.mockRestore();
    });

    beforeEach(() => {
        // Clear all mocks and reset navigator instance
        jest.clearAllMocks();
        navigator = new PostNavigator(init_url, social);

        // Mock XPathManager to return null by default (no button found)
        XPathManager.getOne.mockReturnValue(null);

        // Mock ChangeDetector methods
        ChangeDetector.waitForUrlChanges.mockResolvedValue(true);

        // Mock SELECTORS data
        SELECTORS[social] = {
            newPostButton: 'mockedSelectorForNewPostButton'
        };

        // Crea un mock per l'oggetto 'window' stesso, includendo la proprietà 'location'
        Object.defineProperty(global, 'window', {
            value: {
                location: mockLocation,
            },
            writable: true,
            configurable: true,
        });
    })

    afterEach(() => {
        global.resetMockLocation = (newHref = init_url) => {
            mockLocation.href = newHref;
        };
    })

    test('should initialize postUrl, social, and hasNextBtn correctly', () => {
        expect(navigator.postUrl).toBe(init_url);
        expect(navigator.social).toBe(social);
        expect(navigator.hasNextBtn).toBe(true);
    });

    test('setters should modify parameters correctly', () => {
        navigator.hasNextBtn = false;
        expect(navigator.hasNextBtn).toBe(false);
        navigator.postUrl = next_url;
        expect(navigator.postUrl).toBe(next_url);
        navigator.social = 'facebook';
        expect(navigator.social).toBe('facebook');
    });

    test('should set hasNextBtn to false if no next post button is found', async () => {
        // XPathManager.getOne mockato per restituire false di default
        await navigator.next();

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].newPostButton);
        expect(navigator.hasNextBtn).toBe(false);
        expect(navigator.postUrl).toBe(init_url); //non deve cambiare postUrl se non trova il pulsante
        expect(consoleLogSpy).toHaveBeenCalledWith("Nessun pulsante di prossimo post trovato");
    });

    test('should click the next post button and wait for URL changes', async () => {
        const mockButton = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockButton); // trova il pulsante

        // Simula cambio url
        ChangeDetector.waitForUrlChanges.mockImplementation(async (oldUrl) => {
            if (oldUrl === init_url) {
                Object.defineProperty(window, 'location', {
                    value: { href: next_url },
                    writable: true
                });
            }
            return Promise.resolve(true);
        });

        await navigator.next();

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].newPostButton);
        expect(mockButton.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
        expect(navigator.postUrl).toBe(next_url); 
        expect(navigator.hasNextBtn).toBe(true); //pulsante trovato quindi rimane a true
    });

    test('should handle waitForUrlChanges rejection and set hasNextBtn to false', async () => {
        const mockButton = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockButton);

        const mockError = new Error('URL change timeout');
        ChangeDetector.waitForUrlChanges.mockRejectedValue(mockError); // Simula fallimento cambio URL

        await expect(navigator.next()).rejects.toThrow(mockError);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].newPostButton);
        expect(mockButton.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
        expect(navigator.hasNextBtn).toBe(false); 
        expect(navigator.postUrl).toBe(init_url); // se fallisce non cambia postUrl
    });
})