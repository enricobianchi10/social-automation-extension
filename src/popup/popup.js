document.getElementById("savePost").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({action: "getPost", tabId: tab.id});
})