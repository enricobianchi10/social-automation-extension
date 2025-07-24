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
    });

    afterEach(() => {
        jest.useRealTimers();
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
})

