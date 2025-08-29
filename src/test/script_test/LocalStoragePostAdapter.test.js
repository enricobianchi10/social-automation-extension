const StorageService = require('@src/script/storage/StorageService');
global.StorageService = StorageService;
const LocalStoragePostAdapter = require('@src/script/storage/post/LocalStoragePostAdapter');
const Post = require('@src/model/Post'); 
global.Post = Post;
const utils = require('@src/utils/utils');
global.generateCommentId = utils.generateCommentId;

jest.mock('@src/model/Post');
jest.mock('@src/utils/utils', () => ({
    ...jest.requireActual('@src/utils/utils'),
    generateCommentId: jest.fn((author, text) => Promise.resolve(`mock-id-${author}-${text}`)),
}));

//mock di chrome API utlizzate
const mockChromeStorageLocal = {
    get: jest.fn(),
    set: jest.fn(),
};

Object.defineProperty(global, 'chrome', {
    value: {
        storage: {
            local: mockChromeStorageLocal,
        },
    },
    writable: true,
    configurable: true,
});

describe('LocalStoragePostAdapter', () => {
    let adapter;

    beforeEach(() => {
        jest.clearAllMocks();

        adapter = new LocalStoragePostAdapter();

        mockChromeStorageLocal.get.mockResolvedValue({});
        mockChromeStorageLocal.set.mockResolvedValue(undefined);

        //reset del mock
        utils.generateCommentId.mockImplementation((author, text) => Promise.resolve(`mock-id-${author}-${text}`));

        Post.mockImplementation((number, url, imgSrc, caption, likes, comments) => ({
            _number: number,
            _url: url,
            _src: imgSrc,
            _caption: caption,
            _likes_number: likes,
            _comments: comments,
            get number() { return this._number; },
            get url() { return this._url; },
            get src() { return this._src; },
            get caption() { return this._caption; },
            get likesNumber() { return this._likes_number; },
            get comments() { return this._comments; },
        }));
    });

    //test per save()
    test('save() should save a new post with generated comment IDs', async () => {
        const mockComment1 = { _author: 'author1', _text: 'text1' }; 
        const mockComment2 = { _author: 'author2', _text: 'text2' };

        const mockPost = {
            _number: 1,
            _url: 'http://example.com/p/1',
            _imgSrc: 'http://example.com/img.jpg',
            _caption: 'Caption 1',
            _likes_number: '100',
            _comments: [mockComment1, mockComment2],
        };

        mockChromeStorageLocal.get.mockResolvedValueOnce({});

        await adapter.save(mockPost);

        expect(mockChromeStorageLocal.get).toHaveBeenCalledWith('postList');
        
        expect(generateCommentId).toHaveBeenCalledTimes(2);
        expect(generateCommentId).toHaveBeenCalledWith('author1', 'text1');
        expect(generateCommentId).toHaveBeenCalledWith('author2', 'text2');

        expect(mockChromeStorageLocal.set).toHaveBeenCalledTimes(1);
        const expectedSavedPostList = {
            postList: {
                'post_1': {
                    ...mockPost,
                    _comments: {
                        'mock-id-author1-text1': mockComment1,
                        'mock-id-author2-text2': mockComment2,
                    }
                },
            },
        };
        expect(mockChromeStorageLocal.set).toHaveBeenCalledWith(expectedSavedPostList);
    });

    test('get() should return a Post object if found', async () => {
        const storedComment1 = { _author: 'a1', _text: 't1' };
        const storedComment2 = { _author: 'a2', _text: 't2' };

        const storedPost = {
            _number: 1,
            _url: 'http://example.com/post/1',
            _scr: 'http://example.com/img1.jpg', 
            _caption: 'Caption 1',
            _likes_number: '100',
            _comments: {
                'comment-id-1': storedComment1,
                'comment-id-2': storedComment2,
            },
        };

        mockChromeStorageLocal.get.mockResolvedValueOnce({
            postList: {
                'post_1': storedPost,
            },
        });

        const retrievedPost = await adapter.get(1);

        expect(mockChromeStorageLocal.get).toHaveBeenCalledWith('postList');
        expect(Post).toHaveBeenCalledWith(
            storedPost._number,
            storedPost._url,
            storedPost._scr,
            storedPost._caption,
            storedPost._likes_number,
            storedPost._comments
        );
        expect(retrievedPost._number).toBe(1);
        expect(retrievedPost._url).toBe('http://example.com/post/1');
        expect(retrievedPost._src).toBe('http://example.com/img1.jpg');
        expect(retrievedPost._caption).toBe('Caption 1');
        expect(retrievedPost._likes_number).toBe('100');
        expect(retrievedPost._comments).toEqual(storedPost._comments);
    });

    test('get() should return null if postList is empty or undefined or post not found', async () => {
        mockChromeStorageLocal.get.mockResolvedValueOnce({}); 
        const retrievedPost1 = await adapter.get(1);
        expect(retrievedPost1).toBeNull();

        mockChromeStorageLocal.get.mockResolvedValueOnce({ postList: undefined });
        const retrievedPost2 = await adapter.get(1);
        expect(retrievedPost2).toBeNull();

        mockChromeStorageLocal.get.mockResolvedValueOnce({ //post non trovato
            postList: {
                'post_999': {}
            }
        });
        const retrievedPost = await adapter.get(1);
        expect(retrievedPost).toBeNull();

        expect(mockChromeStorageLocal.get).toHaveBeenCalledTimes(3);
        expect(Post).not.toHaveBeenCalled();
    });

    test('getAll() should return all posts from storage', async () => {
        const allPosts = {
            'post_1': { _number: 1, _url: 'url1', _comments: {} },
            'post_2': { _number: 2, _url: 'url2', _comments: {} },
        };

        mockChromeStorageLocal.get.mockResolvedValueOnce({
            postList: allPosts
        });

        const retrievedPosts = await adapter.getAll();

        expect(mockChromeStorageLocal.get).toHaveBeenCalledWith('postList');
        expect(retrievedPosts).toEqual(allPosts);
    });
});




