const PathValidator = require('@src/script/validator/PathValidator');
const XPathManager = require('@src/script/manager/XPathManager');
global.XPathManager = XPathManager;
const ChangeDetector = require('@src/script/change-detector/ChangeDetector');
global.ChangeDetector = ChangeDetector;
const SELECTORS = require('@src/utils/selectors');
global.SELECTORS = SELECTORS;
const { ParseError } = require('@src/errors/errors');
global.ParseError = ParseError;
const { delay } = require('@src/utils/utils');
global.delay = delay;

jest.mock('@src/script/manager/XPathManager');
jest.mock('@src/script/change-detector/ChangeDetector');
jest.mock('@src/utils/utils');

describe('PathValidator', () => {
    let validator;
    const social = 'instagram';
    const mockLocation = {
        href: 'www.instagram.com/p/DMxM7zeNex4/',
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
        pathname: '/',
        search: '',
        hash: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();

        validator = new PathValidator(social);

        SELECTORS[social] = {
            postNumber: 'selPostNumber',
            lastPostLink: 'selLastPostLink',
            postImage: 'selPostImage',
            postCaption: 'selPostCaption',
            postLikesNumber: 'selPostLikes',
            newPostButton: 'selNewPostButton',
            newCommentsButton: 'mockedSelectorNewCommentsBtn',
            commentText: 'mockedSelectorCommentText',
            commentAuthor: 'mockedSelectorCommentAuthor',
            boxComment: 'selBoxComment',
            repliesTextArea: 'selReplyArea',
            publishCommentButton: 'selPublishBtn'
        };

        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].lastPostLink:
                    return { click: () => { window.location.href = 'www.instagram.com/p/DMxM7zeNex4/' } };
                default: return null;
            }
        });
        XPathManager.getAll.mockReturnValue([]);
        ChangeDetector.waitForUrlChanges.mockResolvedValue();
        ChangeDetector.waitForLoading.mockResolvedValue();

        Object.defineProperty(global, 'window', {
            value: {
                location: mockLocation,
            },
            writable: true,
            configurable: true,
        });
    });

    test('should initialize correctly social and errors', () => {
        expect(validator.social).toBe(social);
        expect(validator.errors).toEqual([]);
    });

    test('constructor should accept array of errors', () => {
        const err = new Error('test');
        const val = new PathValidator(social, [err]);
        expect(val.errors).toEqual([err]);
    });

    test('constructor should accept single error', () => {
        const err = new Error('singolo');
        const val = new PathValidator(social, err);
        expect(val.errors).toEqual([err]);
    });

    test('set should modify errors correctly', () => {
        validator.errors = null;
        expect(validator.errors).toEqual([]);

        const err = new Error('test2');
        validator.errors = err;
        expect(validator.errors).toEqual([err]);

        const errArr = [new Error('uno'), new Error('due')];
        validator.errors = errArr;
        expect(validator.errors).toEqual(errArr);
    });

    test('_addError should push error to array errors', () => {
        const err = new Error('errore da aggiungere');
        validator._addError(err);
        expect(validator.errors).toContain(err);
    });

    test('_clearErrors should clear errors array', () => {
        validator.errors = [new Error('e1'), new Error('e2')];
        expect(validator.errors.length).toBe(2);
        validator._clearErrors();
        expect(validator.errors.length).toBe(0);
    });

    //validateCommentScraping
    test('_validateCommentScraping should adds errors when selectors find nothing', async () => {

        await validator._validateCommentScraping();

        expect(validator.errors.length).toBeGreaterThanOrEqual(3);
        const messages = validator.errors.map(e => e.message);
        expect(messages).toContain("Pulsante per caricare nuovi commenti non trovato");
        expect(messages).toContain("Testi dei commenti non trovati");
        expect(messages).toContain("Autori dei commenti non trovati");
    });

    test('_validateCommentScraping should adds only newCommBtn error when button not found but initial comments found', async () => {

        const commentList = Array.from({ length: 2 }, (_, i) => ({ innerText: `comment ${i}` }));
        XPathManager.getAll.mockReturnValue(commentList);

        await validator._validateCommentScraping();

        expect(validator.errors.length).toBe(1);
        const messages = validator.errors.map(e => e.message);
        expect(messages).toContain("Pulsante per caricare nuovi commenti non trovato");
        expect(messages).not.toContain("Testi dei commenti non trovati");
        expect(messages).not.toContain("Autori dei commenti non trovati");
    });

    test('_validateCommentScraping should handles timeout and adds appropriate errors', async () => {
        const fakeButton = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(fakeButton);

        ChangeDetector.waitForLoading.mockRejectedValueOnce(new Error('timeout'));

        await validator._validateCommentScraping();

        expect(fakeButton.click).toHaveBeenCalled();
        const messages = validator.errors.map(e => e.message);
        expect(validator.errors.length).toBeGreaterThanOrEqual(3);
        expect(messages).toContain("Il caricamento dei nuovi commenti ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione");
        expect(messages).toContain("Testi dei commenti non trovati");
        expect(messages).toContain("Autori dei commenti non trovati");
    });

    test('_validateCommentScraping should show only timeout error when initial comments found', async () => {
        const fakeButton = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(fakeButton);
        const commentList = Array.from({ length: 7}, (_, i) => ({ innerText: `comment ${i}` }));
        XPathManager.getAll.mockReturnValue(commentList);

        ChangeDetector.waitForLoading.mockRejectedValueOnce(new Error('timeout'));

        await validator._validateCommentScraping();

        expect(fakeButton.click).toHaveBeenCalled();
        const messages = validator.errors.map(e => e.message);
        expect(validator.errors.length).toBe(1);
        expect(messages).toContain("Il caricamento dei nuovi commenti ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione");
        expect(messages).not.toContain("Testi dei commenti non trovati");
        expect(messages).not.toContain("Autori dei commenti non trovati");
    });

    test('_validateCommentScraping should yields no errors when everything is found', async () => {
        const fakeButton = { click: jest.fn() };
        const commentList = Array.from({ length: 20 }, (_, i) => ({ innerText: `comment ${i}` }));

        XPathManager.getOne.mockReturnValue(fakeButton);
        XPathManager.getAll.mockReturnValue(commentList);
        ChangeDetector.waitForLoading.mockResolvedValue();

        await validator._validateCommentScraping();

        expect(validator.errors).toEqual([]);
        expect(fakeButton.click).toHaveBeenCalled();
    });

    test('_validateCommentScraping should add errors if fewer than 20 comments found', async () => {
        const fakeButton = { click: jest.fn() };
        const commentList = Array.from({ length: 10 }, () => ({}));

        XPathManager.getOne.mockReturnValue(fakeButton);
        XPathManager.getAll.mockReturnValue(commentList);
        ChangeDetector.waitForLoading.mockResolvedValue();

        await validator._validateCommentScraping();

        const messages = validator.errors.map(e => e.message);
        expect(messages).toContain("Numero totale di commenti trovati errato");
        expect(messages).toContain("Numero totale di autori dei commenti trovati errato");
    });

    test('_validateCommentScraping should add errors when comment text and authors not found', async () => {
        const fakeButton = { click: jest.fn() };

        XPathManager.getOne.mockReturnValue(fakeButton);
        ChangeDetector.waitForLoading.mockResolvedValue();

        await validator._validateCommentScraping();

        const messages = validator.errors.map(e => e.message);
        expect(messages).toContain("Testi dei commenti non trovati");
        expect(messages).toContain("Autori dei commenti non trovati");
    });

    //validatePostScraping
    test('_validatePostScraping should adds error when post number or last post link not found', async () => {
        XPathManager.getOne.mockReturnValue(null);

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Numero di post non trovato");
        expect(msgs).toContain("Link all'ultimo post del profilo non trovato");
    });

    test('_validatePostScraping should handles lastPostLink click and incorrect URL', async () => {
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].lastPostLink:
                    return { click: () => { window.location.href = 'www.instagram.com/p/wrong/' } };
                default: return null;
            }
        });

        ChangeDetector.waitForUrlChanges.mockResolvedValueOnce();

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Link all'ultimo post ha portato al post errato");
    });

    test('_validatePostScraping should adds error when postNumber textContent is wrong', async () => {
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {    
                case SELECTORS[social].postNumber:
                    return { textContent: '3' }
                default:
                    return null;
            }
        });

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Numero di post trovato ma errato");
    });

    test('_validatePostScraping should adds error when URL change is too slow', async () => {

        ChangeDetector.waitForUrlChanges.mockRejectedValue(new Error('Second timeout'));
        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain(
            "Il caricamento del post ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione"
        );
    });

    test('_validatePostScraping should adds errors when image, caption or likes missing or wrong', async () => {

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Url dell'immagine del post non trovato");
        expect(msgs).toContain("Caption del post non trovata");
        expect(msgs).toContain("Numero likes del post non trovato");
    });

    test('_validatePostScraping should detect wrong caption text or insufficient likes', async () => {
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].lastPostLink:
                    return { click: jest.fn() };
                case SELECTORS[social].postCaption:
                    return { innerText: 'Wrong Caption' };
                case SELECTORS[social].postLikesNumber:
                    return { innerText: '1' };
                default: return null;
            }
        });

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Caption del post trovata ma errata");
        expect(msgs).toContain("Numero likes del post trovato ma errato");
    });

    test('_validatePostScraping should handles newPostButton click and incorrect next URL', async () => {
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].lastPostLink:
                    return { click: jest.fn() };
                case SELECTORS[social].newPostButton:
                    return { click: () => { window.location.href = 'www.instagram.com/p/wrong_post/'} };
                default: return null;
            }
        });

        ChangeDetector.waitForUrlChanges.mockResolvedValueOnce().mockResolvedValueOnce();

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Pulsante per raggiungere post successivo ha portato al post errato");
    });

    test('_validatePostScraping should adds error if new post button is not found', async () => {

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Pulsante per raggiungere post successivo non trovato");
    });

    test('_validatePostScraping should add error when new post button fails to load next post', async () => {
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].lastPostLink:
                    return { click: jest.fn() };
                case SELECTORS[social].newPostButton:
                    return { click: jest.fn() };
                default: return null;
            }
        });

        ChangeDetector.waitForUrlChanges
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(new Error('Second timeout'));

        await validator._validatePostScraping();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Il caricamento del nuovo post ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione");
    });

    test('_validatePostScraping should yield no errors when everything is correct', async () => {
        // Mocks dei nodi HTML con valori di controllo corretti
        const mockPostNumber = { textContent: "5" };
        const mockLastPostLink = { click: jest.fn() };
        const mockPostImage = {}; // presenza basta
        const mockPostCaption = { innerText: "Caption" };
        const mockPostLikes = { innerText: "2" };
        const mockNextPostBtn = { click: jest.fn() };

        // Ordine chiamate getOne secondo la funzione
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].postNumber:
                    return mockPostNumber;
                case SELECTORS[social].lastPostLink:
                    return mockLastPostLink;
                case SELECTORS[social].postImage:
                    return mockPostImage;
                case SELECTORS[social].postCaption:
                    return mockPostCaption;
                case SELECTORS[social].postLikesNumber:
                    return mockPostLikes;
                case SELECTORS[social].newPostButton:
                    return mockNextPostBtn;
                default:
                    return null;
            }
        });

        // Simulazione URL corretti
        const initialUrl = 'https://instagram.com/profile';
        window.location.href = initialUrl;

        // Simula il cambio URL per i due click
        ChangeDetector.waitForUrlChanges
        .mockImplementationOnce(async () => {
            window.location.href = 'https://instagram.com/p/DMxM7zeNex4/'; //url corretto ultimo post
        })
        .mockImplementationOnce(async () => {
            window.location.href = 'https://instagram.com/p/DMp-WpEt_hR/'; //url corretto penultimo post
        });

        ChangeDetector.waitForLoading.mockResolvedValue();
        validator._validateCommentScraping = jest.fn().mockResolvedValue();

        await validator._validatePostScraping();

        expect(validator.errors).toHaveLength(0);

        expect(mockLastPostLink.click).toHaveBeenCalled();
        expect(mockNextPostBtn.click).toHaveBeenCalled();
    });

    //validatePublishing
    test('_validatePublishing should adds error if no comment boxes found', async () => {
        await validator._validatePublishing();
        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Lista dei commenti non trovata");
    });

    test('_validatePublishing should adds error if filtering fails (wrong comment author/text)', async () => {
        const mockCommentBox = {
            querySelector: (selector) => {
                if (selector === 'h3') return { innerText: 'account_prova1212' };
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'span') return [{}, {}, { innerText: 'commento sbagliato' }];
                return [];
            }
        };
        XPathManager.getAll.mockReturnValue([mockCommentBox]);
        await validator._validatePublishing();
        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Il filtraggio dei commenti non è andato a buon fine");
    });

    test('_validatePublishing should adds error if reply button missing', async () => {
        const mcokCommentBox = {
            querySelector: (selector) => {
                if (selector === 'h3') return { innerText: 'account_prova1212' };
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'span') return [{}, {}, { innerText: 'commento nuovo1' }];
                return [];
            }
        };
        XPathManager.getAll.mockReturnValue([mcokCommentBox]);
        await validator._validatePublishing();
        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Pulsante per rispondere ad un commento non trovato");
    });

    test('_validatePublishing should adds error if reply textarea missing', async () => {
        const mockCommentBox = {
            querySelector: (selector) => {
                if (selector === 'h3') return { innerText: 'account_prova1212' };
                if (selector === 'button') return {  click: jest.fn()  };
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'span') return [{}, {}, { innerText: 'commento nuovo1' }];
                return [];
            }
        };
        XPathManager.getAll.mockReturnValue([mockCommentBox]);
        await validator._validatePublishing();
        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Area di testo per la risposta al commento non trovata");
    });

    test('_validatePublishing should adds error if publish button missing', async () => {
        const mockCommentBox = {
            querySelector: (selector) => {
                if (selector === 'h3') return { innerText: 'account_prova1212' };
                if (selector === 'button') return {  click: jest.fn()  };
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'span') return [{}, {}, { innerText: 'commento nuovo1' }];
                return [];
            }
        };
        const mockRepliesTextArea = {
            value: '',
            dispatchEvent: jest.fn()
        };

        if (!window.HTMLTextAreaElement) {
            window.HTMLTextAreaElement = function () {};
            window.HTMLTextAreaElement.prototype = {};
        }

        Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', {
            set: function(val) {
                this._value = val;
            },
            configurable: true
        });
         
        XPathManager.getAll.mockReturnValue([mockCommentBox]);
        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].repliesTextArea:
                    return mockRepliesTextArea;
                default: return null;
            }
        });
        ChangeDetector.waitForLoading.mockResolvedValue();
        await validator._validatePublishing();
        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Pulsante per pubblicare la risposta al commento non trovato");
    });

    test('_validatePublishing should yields no errors when everything is found', async () => {
        const mockClick = jest.fn();
        const mockDispatchEvent = jest.fn();

        const mockCommentBox = {
            querySelector: (selector) => {
                if (selector === 'h3') return { innerText: 'account_prova1212' };
                if (selector === 'button') return { click: mockClick };
                return null;
            },
            querySelectorAll: (selector) => {
                if (selector === 'span') return [{}, {}, { innerText: 'commento nuovo1' }];
                return [];
            }
        };

        const mockRepliesTextArea = {
            value: '',
            dispatchEvent: mockDispatchEvent
        };

        const mockPublishBtn = {
            click: mockClick
        };

        if (!window.HTMLTextAreaElement) {
            window.HTMLTextAreaElement = function () {};
            window.HTMLTextAreaElement.prototype = {};
        }

        // Mock HTMLTextAreaElement.value setter
        Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', {
            set: function(val) {
                this._value = val;
            }
        });

        XPathManager.getAll.mockReturnValue([mockCommentBox]);

        XPathManager.getOne.mockImplementation(selector => {
            switch (selector) {
                case SELECTORS[social].repliesTextArea:
                    return mockRepliesTextArea;
                case SELECTORS[social].publishCommentButton:
                    return mockPublishBtn;
                default:
                    return null;
            }
        });

        ChangeDetector.waitForLoading.mockResolvedValue();

        await validator._validatePublishing();

        expect(validator.errors).toHaveLength(0);

        expect(mockClick).toHaveBeenCalledTimes(1); //viene clickato solo il primo pulsante (non quello per pubblicare commento)

    })

    //_validateProfileReaching
    test('_validateProfileReaching should add error if profile link is not found', async () => {
        await validator._validateProfileReaching();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Link per raggiungere il proprio profilo non trovato");
    });

    test('_validateProfileReaching should add error if waitForUrlChanges throws (timeout or error)', async () => {
        const mockProfileLink = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockProfileLink);

        ChangeDetector.waitForUrlChanges.mockRejectedValue(new Error("timeout"));

        await validator._validateProfileReaching();

        expect(mockProfileLink.click).toHaveBeenCalled();

        const msgs = validator.errors.map(e => e.message);
        expect(msgs).toContain("Il caricamento del profilo ha richiesto troppo tempo, verifica che non ci siano problemi di connessione e riavvia l'estensione");
    });

    test('_validateProfileReaching should not add errors if profile link exists and url changes correctly', async () => {
        const mockProfileLink = { click: jest.fn() };
        XPathManager.getOne.mockReturnValue(mockProfileLink);
        ChangeDetector.waitForUrlChanges.mockResolvedValue();

        await validator._validateProfileReaching();

        expect(mockProfileLink.click).toHaveBeenCalled();
        expect(validator.errors.length).toBe(0);
    });

    //validate controllo solo che esegua i metodi in ordine 
    test('validate should call all validation steps in order', async () => {
        
        delay.mockResolvedValue();
        /*const postValSpy = jest.spyOn(validator, '_validatePostScraping').mockResolvedValue();
        const publValSpy = jest.spyOn(validator, '_validatePublishing').mockResolvedValue();
        const profReachValSpy = jest.spyOn(validator, '_validateProfileReaching').mockResolvedValue();*/
        
        validator._validatePostScraping = jest.fn().mockResolvedValue();
        validator._validatePublishing = jest.fn().mockResolvedValue();
        validator._validateProfileReaching = jest.fn().mockResolvedValue();
        
        await validator.validate();

        expect(validator._validatePostScraping).toHaveBeenCalledTimes(1);
        expect(validator._validatePublishing).toHaveBeenCalledTimes(1);
        expect(validator._validateProfileReaching).toHaveBeenCalledTimes(1);

        expect(validator._validatePostScraping.mock.invocationCallOrder[0]).toBeLessThan(
            validator._validatePublishing.mock.invocationCallOrder[0]
        );
        expect(validator._validatePublishing.mock.invocationCallOrder[0]).toBeLessThan(
            validator._validateProfileReaching.mock.invocationCallOrder[0]
        );
    });
  
})