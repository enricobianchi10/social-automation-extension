/**
 * @jest-environment jsdom
 */

const ChangeDetector = require('@src/script/change-detector/ChangeDetector');
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;
const UrlError = require('@src/errors/errors');
global.UrlError = UrlError;

jest.mock('@src/script/manager/XPathManager');

describe('ChangeDetector', () => {

    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks()
    });

    test('checkIfCommentLoad should return true if comment are found', () => {
        // Simula che XPathManager.getAll trovi dei nodi
        XPathManager.getAll.mockReturnValue([
            { textContent: 'Comment 1' },
            { textContent: 'Comment 2' }
        ]);

        const result = ChangeDetector.checkIfCommentLoad('instagram');

        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS.instagram.commentText);
        expect(result).toBe(true);
    })

    test('checkIfCommentLoad should return false if no comments are found', () => {
        XPathManager.getAll.mockReturnValue([]);

        const result = ChangeDetector.checkIfCommentLoad('instagram');

        expect(XPathManager.getAll).toHaveBeenCalledWith(SELECTORS.instagram.commentText);
        expect(result).toBe(false);
    })

    test('checkIfPostLoad should return true if post is found', () => {
        XPathManager.getOne.mockReturnValue(
            { post: 'Post 1'}
        );

        const result = ChangeDetector.checkIfPostLoad('instagram');

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS.instagram.lastPostLink);
        expect(result).toBe(true);
    })

    test('checkIfPostLoad should return true if post is found', () => {
        XPathManager.getOne.mockReturnValue(null);

        const result = ChangeDetector.checkIfPostLoad('instagram');

        expect(XPathManager.getOne).toHaveBeenCalledWith(SELECTORS.instagram.lastPostLink);
        expect(result).toBe(false);
    })

    test('waitForUrlChanges should resolve if URL changes before timeout', async () => {
        const oldUrl = 'http://localhost/old';
        const promise = ChangeDetector.waitForUrlChanges(oldUrl);
        jest.advanceTimersByTime(1200);
        await expect(promise).resolves.toBeUndefined();
    });

    test('waitForUrlChanges should reject if URL doesnt change before timeout', async () => {
        const oldUrl = window.location.href;
        const promise = ChangeDetector.waitForUrlChanges(oldUrl);
        jest.advanceTimersByTime(15000);
        await expect(promise).rejects.toThrow(UrlError);
    });

    test('waitForLoading should resolve after 2 seconds inactivity if DOM changes before timeout', async () => {
        let mockObserve = jest.fn();
        let mockDisconnect = jest.fn();

        //mock di MutationObserver
        global.MutationObserver = jest.fn((callback) => {
            mockCallback = callback; // Salva la callback per poterla chiamare
            return {
                observe: mockObserve,
                disconnect: mockDisconnect,
            };
        });

        const promise = ChangeDetector.waitForLoading();
        expect(mockObserve).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
        expect(global.MutationObserver).toHaveBeenCalledTimes(1);
        // Simula il trigger della callback dell'observer (una mutazione)
        mockCallback(); 
        jest.advanceTimersByTime(1000);
        mockCallback();
        jest.advanceTimersByTime(2000);

        //dovrebbe risolversi la promise e disconnettere l'observer
        await expect(promise).resolves.toBeUndefined();
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    })

    test('waitForLoading should reject after 10 seconds if DOM doesnt changes', async () => {
        let mockObserve = jest.fn();
        let mockDisconnect = jest.fn();

        //mock di MutationObserver
        global.MutationObserver = jest.fn((callback) => {
            mockCallback = callback; // Salva la callback per poterla chiamare
            return {
                observe: mockObserve,
                disconnect: mockDisconnect,
            };
        });

        const promise = ChangeDetector.waitForLoading();
        expect(mockObserve).toHaveBeenCalledTimes(1);
        
        // Avanza il tempo fino al timeout dei 10 secondi
        jest.advanceTimersByTime(10000);

        // La Promise dovrebbe rigettare e l'observer dovrebbe essere disconnesso
        await expect(promise).rejects.toBeUndefined();
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
    })
});

