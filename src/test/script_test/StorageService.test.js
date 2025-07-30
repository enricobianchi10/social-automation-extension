const StorageService = require('@src/script/storage/StorageService');

describe('StorageService', () => {
    let storageServiceInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        storageServiceInstance = new StorageService();
    });

    test('save() should throw an error if not implemented by subclass', () => {
        expect(() => storageServiceInstance.save({})).toThrow('save() must be implemented');
    });

    test('get() should throw an error if not implemented by subclass', () => {
        expect(() => storageServiceInstance.get('some-id')).toThrow('get() must be implemented');
    });

    test('getAll() should throw an error if not implemented by subclass', () => {
        expect(() => storageServiceInstance.getAll()).toThrow('getAll() must be implemented');
    });
});