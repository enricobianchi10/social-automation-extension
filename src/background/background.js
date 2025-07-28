//import { create } from 'https://esm.sh/jsondiffpatch';
import diff from 'https://esm.sh/deep-diff';

/* Configurazione base (opzionale)
const jsondiffpatch = create({
  objectHash: function(obj) {
    return obj.id || JSON.stringify(obj);
  }
}); */

/* Esempio di diff
const a = {
  "postList": {
    "post_1": {
      "_caption": "Questa è una tigre",
      "_comments": {},
      "_likes_number": "0",
      "_number": 1,
      "_src": "Video",
      "_url": "https://www.instagram.com/p/DLkPkcLtGy1/"
    },
    "post_2": {
      "_caption": "Secondo post prova",
      "_comments": {
        "0e56a286f3b8c70a3bb2126390104624b0c97ba4f2dc16cdd49079100dbf04e6": {
          "_author": "account_prova1212",
          "_text": "commento 3"
        },
        "bee5eba425213fd4b6bd68d84926b89f08db57688815c8ffc1ce9c83207b98e0": {
          "_author": "account_prova1212",
          "_text": "commento 2"
        },
        "fef680629c3917169b6e96cc932c897115f482f80e62d460ac5980f6c5c39d8e": {
          "_author": "account_prova1212",
          "_text": "commento 1"
        }
      },
      "_likes_number": "0",
      "_number": 2,
      "_src": "https://instagram.ftrn5-2.fna.fbcdn.net/v/t51.2885-15/517362889_17844743232524652_3983943700133631149_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjkxM3g5MTMuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.ftrn5-2.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QF_vXL-tnSfcxeseBYa_kT-4Ui_Gt2VLmDmNsj_DwRGI58s59GK-7chPiO-sZFLl-k&_nc_ohc=xD2bfwwgqDsQ7kNvwGB3v3x&_nc_gid=HCGUsKEMzrEZ9LUsm0w80A&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzY3MTQ3NTUwNTQ4ODg3ODI1Ng%3D%3D.3-ccb7-5&oh=00_AfSgzKSrBaO8jm4NCWAVqU3I98uBM2VqPldnDJ0G5iXN3w&oe=68898653&_nc_sid=7a9f4b",
      "_url": "https://www.instagram.com/p/DLzs4UaNlqw/"
    },
    "post_3": {
      "_caption": "Harry Potter",
      "_comments": {
        "35d837e860f4e0d00889cf64e81a979e89dd3f4b23129817c0736a9ac9848cfd": {
          "_author": "account_prova1212",
          "_text": "commento nuovo1"
        }
      },
      "_likes_number": "0",
      "_number": 3,
      "_src": "Video",
      "_url": "https://www.instagram.com/p/DL0GFPrNZYs/"
    },
    "post_4": {
      "_caption": "1984",
      "_comments": {},
      "_likes_number": "0",
      "_number": 4,
      "_src": "https://instagram.ftrn5-2.fna.fbcdn.net/v/t51.2885-15/518003624_17845303026524652_5031551325689526934_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjUzNng1MzYuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.ftrn5-2.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QF_vXL-tnSfcxeseBYa_kT-4Ui_Gt2VLmDmNsj_DwRGI58s59GK-7chPiO-sZFLl-k&_nc_ohc=PEB36U4QXVsQ7kNvwFfidMP&_nc_gid=HCGUsKEMzrEZ9LUsm0w80A&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzY3MzUyODYyNTY5MzkxNjkwMA%3D%3D.3-ccb7-5&oh=00_AfT5g7wadilA1ObHQGJkvxck82DqthsCrgVjAvADecS2xA&oe=68896225&_nc_sid=7a9f4b",
      "_url": "https://www.instagram.com/p/DL6_tJmtv7k/"
    }
  }
}
const b = {
  "postList": {
    "post_1": {
      "_caption": "Questa è una volpe",
      "_comments": {},
      "_likes_number": "0",
      "_number": 1,
      "_src": "Video",
      "_url": "https://www.instagram.com/p/DLkPkcLtGy1/"
    },
    "post_2": {
      "_caption": "Secondo post prova",
      "_comments": {
        "fef680629c3917169b6e96cc932c897115f482f80e62d460ac5980f6c5c39d8e": {
          "_author": "account_prova1212",
          "_text": "commento 1"
        },
        "bee5eba425213fd4b6bd68d84926b89f08db57688815c8ffc1ce9c83207b98e0": {
          "_author": "account_nuovo",
          "_text": "commento 2"
        },
        "hash4": {
          "_author": "Author",
          "_text": "Text"
        }
      },
      "_likes_number": "5",
      "_number": 2,
      "_src": "https://instagram.ftrn5-2.fna.fbcdn.net/v/t51.2885-15/517362889_17844743232524652_3983943700133631149_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjkxM3g5MTMuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.ftrn5-2.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QF_vXL-tnSfcxeseBYa_kT-4Ui_Gt2VLmDmNsj_DwRGI58s59GK-7chPiO-sZFLl-k&_nc_ohc=xD2bfwwgqDsQ7kNvwGB3v3x&_nc_gid=HCGUsKEMzrEZ9LUsm0w80A&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzY3MTQ3NTUwNTQ4ODg3ODI1Ng%3D%3D.3-ccb7-5&oh=00_AfSgzKSrBaO8jm4NCWAVqU3I98uBM2VqPldnDJ0G5iXN3w&oe=68898653&_nc_sid=7a9f4b",
      "_url": "https://url"
    },
    "post_3": {
      "_caption": "Harry Potter",
      "_comments": {
        "35d837e860f4e0d00889cf64e81a979e89dd3f4b23129817c0736a9ac9848cfd": {
          "_author": "account_prova1212",
          "_text": "commento nuovo1"
        }
      },
      "_likes_number": "0",
      "_number": 3,
      "_src": "Video",
      "_url": "https://www.instagram.com/p/DL0GFPrNZYs/"
    },
    "post_4": {
      "_caption": "1984",
      "_comments": {},
      "_likes_number": "0",
      "_number": 4,
      "_src": "https://instagram.ftrn5-2.fna.fbcdn.net/v/t51.2885-15/518003624_17845303026524652_5031551325689526934_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjUzNng1MzYuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.ftrn5-2.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QF_vXL-tnSfcxeseBYa_kT-4Ui_Gt2VLmDmNsj_DwRGI58s59GK-7chPiO-sZFLl-k&_nc_ohc=PEB36U4QXVsQ7kNvwFfidMP&_nc_gid=HCGUsKEMzrEZ9LUsm0w80A&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzY3MzUyODYyNTY5MzkxNjkwMA%3D%3D.3-ccb7-5&oh=00_AfT5g7wadilA1ObHQGJkvxck82DqthsCrgVjAvADecS2xA&oe=68896225&_nc_sid=7a9f4b",
      "_url": "https://www.instagram.com/p/DL6_tJmtv7k/"
    }
  }
}

const delta = jsondiffpatch.diff(a, b);
const differences = diff(a, b);
console.log("Differenza jsondiffpatch:", JSON.stringify(delta, null, 2)); 
console.log("Differenza deepdiff:", JSON.stringify(differences, null, 2)); 
*/

let oldPostList;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

//riceve l'evento emesso dal pulsante del sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action){
        case 'savePost':
            console.log("Ricevuta richiesta di salvare il post");
            chrome.tabs.sendMessage(sender.tab.id, { action: "savePost", post: message.post }, (response) => {
                sendResponse(response);
            });
            return true;
    }
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action){
        case 'getPost':
            console.log("Ricevuta richiesta di ottenere dati del post");
            await chrome.storage.local.set({status: "raccoltaInCorso"});
            try {
                oldPostList = await chrome.storage.local.get("postList");
                console.log("Dati recuperati da storage:", oldPostList);
            } catch (error) {
                console.error("Errore nel recupero dati da storage:", error);
                return;
            }
            chrome.tabs.sendMessage(message.tabId, {action: "scrapePost", social: message.social}); 
            break;
        case 'finishedScrape':
            console.log("Ricevuta notifica di fine scraping");
            await chrome.storage.local.set({status: "finished"});
            try {
                const newPostList = await chrome.storage.local.get("postList");
                console.log("Nuovi dati recuperati da storage:", newPostList);
                const diff = getDiff(oldPostList, newPostList);
                let hasDiff = false;
                if(!diff){ 
                  console.log("Nessuna differenza");
                }
                if(diff) {
                    console.log("C'è differenza");
                    await fetchPostData(diff);
                    hasDiff = true;
                }
                chrome.runtime.sendMessage({action: "finishedScrape", lastPost: message.lastPost, diff: hasDiff});
            } catch (error) {
                console.error("Errore nel recupero dati da storage:", error);
                return;
            }
            break;
        case 'publishComment':
            console.log("Ricevuta richiesta di postare un commento");
            await chrome.storage.local.set({status: "pubblicazioneInCorso"});
            const replies = await fetchGetData();
            console.log('Risposta dal server:', replies);
            chrome.tabs.sendMessage(message.tabId, {action: "publishComment", social: message.social, replies: replies});
            break;
        case 'showError':
            console.log("Ricevuta notifica di mostrare gli errori");
            await chrome.storage.local.set({status: "finished"});
            chrome.runtime.sendMessage({action: "showError", error: message.error});
            break;
        case 'finishedPublish':
            console.log("Ricevuta notifica di fine pubblicazione commenti");
            await chrome.storage.local.set({status: "finished"});
            chrome.runtime.sendMessage({action: "finishedPublish"});
            break;
    }
})


async function fetchPostData(data){
    try {
        const response = await fetch('https://webhook.site/4433d8c6-8dfc-46f3-815a-8f5df33f21f6', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorText = await response.text(); // Prova a leggere il corpo dell'errore
            throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
        }
        const responseData = await response.text(); 
        return responseData; 
    } catch (err) {
        console.error('Errore durante il fetch o l\'elaborazione della risposta:', err);
    }
}

async function fetchGetData(){
    try {
      const response = await fetch('https://webhook.site/4433d8c6-8dfc-46f3-815a-8f5df33f21f6', {
          method: 'GET',
          headers: {
              'Accept': 'application/json'
          }
      });
      if (!response.ok) {
          const errorText = await response.text(); // Prova a leggere il corpo dell'errore
          throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
      }
      const responseData = await response.json(); 
      return responseData; 
    } catch (err) {
        console.error('Errore durante il fetch o l\'elaborazione della risposta:', err);
    }
}

function getDiff(oldList, newList){
    const differences = diff(oldList, newList, (path, key) => {
        if(key === "_src"){
            return true;
        }
        return undefined;
    });
    console.log("Differenza deepdiff:", JSON.stringify(differences, null, 2));
    return differences;
}
