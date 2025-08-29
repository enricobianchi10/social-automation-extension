/**
 * @jest-environment jsdom
 */

const XPathManager = require('@src/script/manager/XPathManager');

describe('XPathManager', () => {
    // Prima di ogni test, popola il DOM simulato
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="root">
                <p class="comment-text">Hello World</p>
                <span class="comment-author">John Doe</span>
                <p class="comment-text">Another comment</p>
                <button id="load-more-comments">Load More</button>
            </div>
        `;
    });

    test('getOne should return the first matching node', () => {
        const node = XPathManager.getOne('//p[@class="comment-text"]');
        expect(node).not.toBeNull();
        expect(node.textContent).toBe('Hello World');
    });

    test('getAll should return all matching node', () => {
        const nodes = XPathManager.getAll('//p[@class="comment-text"]');
        expect(nodes).toHaveLength(2);
        expect(nodes[0].textContent).toBe('Hello World');
        expect(nodes[1].textContent).toBe('Another comment');
    });

    test('getOne should return null if node not found', () => {
        const node = XPathManager.getOne('//div[@id="non-existent"]');
        expect(node).toBeNull();
    });

    test('getAll should return empty array if nodes not found', () => {
        const nodes = XPathManager.getAll('//div[@id="non-existent"]');
        expect(nodes).toHaveLength(0);
    })
})


