chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "openChatGPT") {
    chrome.tabs.create({ url: "https://chat.openai.com/" }, (tab) => {
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: insertPrompt
        });
      }, 5000);
    });
  }
});

function insertPrompt() {
  chrome.storage.local.get("generatedPrompt", (data) => {
    if (document.querySelector("textarea")) {
      document.querySelector("textarea").value = data.generatedPrompt;
      document.querySelector("textarea").dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        document.querySelector("button").click();
      }, 1000);
    } else {
      alert("Please log in to ChatGPT first.");
    }
  });
}