const InstagramPageNavigator = require('@src/script/navigator/InstagramPageNavigator');
const ChangeDetector = require('@src/script/change-detector/ChangeDetector');
global.ChangeDetector = ChangeDetector;
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;
const utils = require('@src/utils/utils');
global.isSamePost = utils.isSamePost;
const UrlError = require('@src/errors/errors');
global.UrlError = UrlError;

jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/script/change-detector/ChangeDetector');
jest.mock('@src/utils/utils', () => ({
    ...jest.requireActual('@src/utils/utils'), //Mantiene le implementazioni reali di tutte le altre esportazioni
    isSamePost: jest.fn(jest.requireActual('@src/utils/utils').isSamePost), //mock funzione isSamePost
}));

describe('InstagramPageNavigator', () => {
    const social = 'instagram';
    const init_url = 'http://instagram.com/p/current_post/';
    const last_post_url = 'http://instagram.com/p/last_post/';
    const profile_url = 'http://instagram.com/profile_name/';

    let consoleLogSpy;
    let currentMockUrl;

    const mockLocation = {
        href: init_url, // URL iniziale di default
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
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
        jest.clearAllMocks();

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        currentMockUrl = init_url;

        // mock dei metodi utilizzati
        XPathManager.getOne.mockReturnValue(null); // nessun link trovato
        ChangeDetector.waitForUrlChanges.mockResolvedValue(true); // url cambia con successo
        ChangeDetector.waitForLoading.mockResolvedValue(true);    // loading con successo
        ChangeDetector.checkIfPostLoad.mockReturnValue(false);    // post non caricato

        // Mock SELECTORS
        SELECTORS[social] = {
            lastPostLink: 'mockedLastPostLinkSelector',
            profileLink: 'mockedProfileLinkSelector'
        };

        // Crea un mock per l'oggetto 'window' stesso, includendo la proprietà 'location'
        Object.defineProperty(global, 'window', {
            value: {
                location: mockLocation,
            },
            writable: true,
            configurable: true,
        });

        // Reset isSamePost mock per ogni test
        isSamePost.mockClear(); 
        isSamePost.mockImplementation(jest.requireActual('@src/utils/utils').isSamePost);
    });

    afterEach(() => {
        // Restore all mocks, including window.location.href getter/setter
        global.resetMockLocation = (newHref = init_url) => {
            mockLocation.href = newHref;
        };
    });

    test('openLastPost should return early and log if no last post link is found', async () => {
        await InstagramPageNavigator.openLastPost(social); //restituisce null per default

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].lastPostLink);
        expect(consoleLogSpy).toHaveBeenCalledWith("Nessun link per aprire l'ultimo post trovato");
        expect(ChangeDetector.waitForUrlChanges).not.toHaveBeenCalled();
        expect(isSamePost).not.toHaveBeenCalled();
    });

    test('should click link and wait for URL changes if link found and not same post', async () => {
        const mockPostLink = { href: last_post_url, click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockPostLink);

        // Simula cambio Url dopo click
        ChangeDetector.waitForUrlChanges.mockImplementation(async (oldUrl) => {
            if (oldUrl === init_url) {
                Object.defineProperty(window, 'location', {
                    value: { href: mockPostLink.href },
                    writable: true
                });
            }
            return Promise.resolve(true);
        });

        await InstagramPageNavigator.openLastPost(social);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].lastPostLink);
        expect(isSamePost).toHaveBeenCalledWith(mockPostLink.href, init_url);
        expect(mockPostLink.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
        expect(window.location.href).toBe(last_post_url);
    });

    test('should log if link found and is same post', async () => {
        const mockPostLink = { href: init_url, click: jest.fn() }; // link punta alla pagina corrente
        XPathManager.getOne.mockReturnValue(mockPostLink);

        await InstagramPageNavigator.openLastPost(social);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].lastPostLink);
        expect(isSamePost).toHaveBeenCalledWith(init_url, mockPostLink.href);
        expect(mockPostLink.click).not.toHaveBeenCalled();
        expect(ChangeDetector.waitForUrlChanges).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith("Sei già nella pagina dell'ultimo post");
    });

})