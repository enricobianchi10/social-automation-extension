class StorageService {
  save(obj) {
    throw new Error('save() must be implemented');
  }

  get(id) {
    throw new Error('get() must be implemented');
  }

  getAll() {
    throw new Error('getAll() must be implemented');
  }
}

/* istanbul ignore next */
// Export for use in Node environment (testing with Jest). Ignored in browsers
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = StorageService;
}