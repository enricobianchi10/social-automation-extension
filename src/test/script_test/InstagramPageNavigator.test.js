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

    test('openLastPost should click link and wait for URL changes if link found and not same post', async () => {
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

    test('openLastPost should log if link found and is same post', async () => {
        const mockPostLink = { href: init_url, click: jest.fn() }; // link punta alla pagina corrente
        XPathManager.getOne.mockReturnValue(mockPostLink);

        await InstagramPageNavigator.openLastPost(social);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].lastPostLink);
        expect(isSamePost).toHaveBeenCalledWith(init_url, mockPostLink.href);
        expect(mockPostLink.click).not.toHaveBeenCalled();
        expect(ChangeDetector.waitForUrlChanges).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith("Sei già nella pagina dell'ultimo post");
    });

    test('openLastPost should re-throw error if waitForUrlChanges fails when opening last post', async () => {
        const mockPostLink = { href: last_post_url, click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockPostLink);
        isSamePost.mockReturnValue(false);

        const mockError = new Error('Failed to load last post');
        ChangeDetector.waitForUrlChanges.mockRejectedValue(mockError);

        await expect(InstagramPageNavigator.openLastPost(social)).rejects.toThrow(mockError);

        expect(mockPostLink.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
    });


    //test per goToProfile

    test('goToProfile should log if no profile link is found', async () => {
        // XPathManager.getOne restituisce null di default
        await InstagramPageNavigator.goToProfile(social);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].profileLink);
        expect(consoleLogSpy).toHaveBeenCalledWith("Link per andare sul profilo non trovato");
        expect(ChangeDetector.waitForUrlChanges).not.toHaveBeenCalled();
        expect(ChangeDetector.checkIfPostLoad).not.toHaveBeenCalled();
        expect(ChangeDetector.waitForLoading).not.toHaveBeenCalled();
    });

    test('goToProfile should click link, wait for URL changes, and wait for posts if link found', async () => {
        const mockProfileLink = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockProfileLink);
        ChangeDetector.checkIfPostLoad.mockReturnValue(false); // Post non caricati, waitForLoading viene eseguita

        // Simula cambio URL
        ChangeDetector.waitForUrlChanges.mockImplementation(async (oldUrl) => {
            currentMockUrl = profile_url; 
            return Promise.resolve(true);
        });

        await InstagramPageNavigator.goToProfile(social);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].profileLink);
        expect(mockProfileLink.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
        expect(currentMockUrl).toBe(profile_url); 
        expect(ChangeDetector.checkIfPostLoad).toHaveBeenCalledWith(social);
        expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);
    });

    test('goToProfile should click link, wait for URL changes, but not wait for posts if already loaded', async () => {
        const mockProfileLink = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockProfileLink);
        ChangeDetector.checkIfPostLoad.mockReturnValue(true); // Posts already loaded

        // Simulate URL change
        ChangeDetector.waitForUrlChanges.mockImplementation(async (oldUrl) => {
            currentMockUrl = profile_url; // Update mock URL
            return Promise.resolve(true);
        });

        await InstagramPageNavigator.goToProfile(social);

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].profileLink);
        expect(mockProfileLink.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
        expect(currentMockUrl).toBe(profile_url);
        expect(ChangeDetector.checkIfPostLoad).toHaveBeenCalledWith(social);
        expect(ChangeDetector.waitForLoading).not.toHaveBeenCalled();
    });

    test('goToProfile should re-throw error if waitForUrlChanges fails when going to profile', async () => {

        const mockProfileLink = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockProfileLink);

        const mockError = new Error('Failed to load profile page');
        ChangeDetector.waitForUrlChanges.mockRejectedValue(mockError);

        await expect(InstagramPageNavigator.goToProfile(social)).rejects.toThrow(mockError);

        expect(mockProfileLink.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForUrlChanges).toHaveBeenCalledWith(init_url);
        expect(ChangeDetector.checkIfPostLoad).not.toHaveBeenCalled();
        expect(ChangeDetector.waitForLoading).not.toHaveBeenCalled();
    });

})