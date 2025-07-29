async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPostId(post_url){
    const match = post_url.match(/\/p\/([^\/?#]+)/);
    return match ? match[1] : null;
}

function isSamePost(url_1, url_2){
    const id_1 = extractPostId(url_1);
    const id_2 = extractPostId(url_2);

    return id_1 && id_2 && id_1 === id_2;
}

/* istanbul ignore next */
// Se vuoi continuare ad esportare qualcosa tramite module.exports,
// assicurati di includere isSamePost qui.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    isSamePost: isSamePost, // Esporta isSamePost tramite CommonJS
    extractPostId: extractPostId
  };
}