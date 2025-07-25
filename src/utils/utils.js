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

async function generateCommentId(author, text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${author}|${text}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}