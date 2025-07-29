const CommentNavigator = require('@src/script/navigator/comment/CommentNavigator');
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

describe('CommentNavigator', () => {
    let navigator;
    let consoleLogSpy;
    const social = 'instagram';

    beforeAll(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleLogSpy.mockRestore(); // Ripristina la console
    });

    beforeEach(() => {
        // Resetta i mock prima di ogni test
        jest.clearAllMocks();
        navigator = new CommentNavigator(social);

        // Imposta i valori di default per i mock
        ChangeDetector.checkIfCommentLoad.mockReturnValue(false); // simula che i commenti di default non siano caricati
        ChangeDetector.waitForLoading.mockResolvedValue(); // Di default, simula che il caricamento vada a buon fine

        // Mock dei selettori per il social specifico
        SELECTORS[social] = {
            newCommentsButton: 'mockedSelectorForNewCommentsButton'
        };
    });

    test('constructor should inizialize hasNewCommBtn and social correctly', () => {
        expect(navigator.hasNewCommBtn).toBe(true);
        expect(navigator.social).toBe(social);
    })

    test('setter should modify parameter correctly', () => {
        navigator.hasNewCommBtn = false;
        expect(navigator.hasNewCommBtn).toBe(false);
        navigator.social = 'facebook';
        expect(navigator.social).toBe('facebook');
    })

    test('should call checkIfCommentLoad and waitForLoading if comments are not initially loaded', async () => {
        // checkIfCommentLoad è mockato per restituire false
        await navigator.next();

        expect(ChangeDetector.checkIfCommentLoad).toHaveBeenCalledWith(social);
        expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);
    })

    test('should not call waitForLoading if comments are already loaded', async () => {
        ChangeDetector.checkIfCommentLoad.mockReturnValue(true);
        
        await navigator.next();

        expect(ChangeDetector.checkIfCommentLoad).toHaveBeenCalledWith(social);
        expect(ChangeDetector.waitForLoading).not.toHaveBeenCalled();
    })

    test('should handle waitForLoading failure for initial comment loading', async () => {
        //checkIfCommentLoad falso e waitForLoading deve fallire
        ChangeDetector.waitForLoading.mockRejectedValue(new Error('Initial loading failed')); // caricamento iniziale fallisce

        await navigator.next();

        expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);
        // il pulsante per prossimi commenti non viene trovato e quindi hasNewCommBtn dovrebbe essere settato a false
        expect(navigator.hasNewCommBtn).toBe(false); 
        //verifica che venga chiamato console log
        expect(consoleLogSpy).toHaveBeenCalledWith("Commenti non presenti o errore nel loro caricamento");
    })

    test('should terminate the loop if no "new comments" button is found', async () => {
        // ChangeDetector.checkIfCommentLoad è false di default e waitForLoading risolve
        XPathManager.getOne.mockReturnValue(null); // Nessun pulsante trovato

        await navigator.next();

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS[social].newCommentsButton);
        expect(navigator.hasNewCommBtn).toBe(false);
        expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(1);
    })

    test('should click the button and wait for new comments to load', async () => {
        const mockButton = { click: jest.fn() };
        // restituisce il puslante la prima volta e poi null
        XPathManager.getOne.mockReturnValueOnce(mockButton).mockReturnValueOnce(null);

        await navigator.next();

        expect(ChangeDetector.checkIfCommentLoad).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(2); // all'inizio e dopo il primo click
        expect(XPathManager.getOne).toHaveBeenCalledTimes(2); // il primo trova il pulsante e il secondo no
        expect(mockButton.click).toHaveBeenCalledTimes(1);
        expect(navigator.hasNewCommBtn).toBe(false); // la seconda iterazione non trova il pulsante e setta la flag a false
    })

    test('should handle waitForLoading failure after a button click', async () => {
        const mockButton = { click: jest.fn() };
        XPathManager.getOne.mockReturnValueOnce(mockButton).mockReturnValueOnce(null);

        // il primo waitForLoading risolve e la seconda no
        ChangeDetector.waitForLoading.mockResolvedValueOnce().mockRejectedValueOnce(new Error('Loading took too long'));

        await navigator.next();

        expect(mockButton.click).toHaveBeenCalledTimes(1);
        expect(ChangeDetector.waitForLoading).toHaveBeenCalledTimes(2);
        expect(navigator.hasNewCommBtn).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith("Il caricamento dei commenti ha richiesto troppo tempo");
    });
})