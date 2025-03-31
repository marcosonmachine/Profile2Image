chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === "insertPromptToChatGPT") {
    // Store XML Prompt
    // Open a new ChatGPT tab
    chrome.tabs.create({ url: "https://chatgpt.com/" }, (tab) => {
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: insertPrompt,
        });
      }, 5000);
    });
  }
});

// Function to insert & submit prompt in ChatGPT
function insertPrompt() {
  chrome.storage.local.get("generatedPrompt", (data) => {
    const textarea = document.querySelector("textarea");
    const promptContainer = document.querySelector("#prompt-textarea");
    if (promptContainer) {
      // Set the innerHTML or text content to the generated prompt.
      promptContainer.innerHTML = data.generatedPrompt;
      promptContainer.dispatchEvent(new Event("input", { bubbles: true }));
      // Click send button
      setTimeout(() => {
        const sendButton = document.querySelector(
          'button[data-testid="send-button"]',
        );
        if (sendButton) {
          sendButton.click();
        }
      }, 1000);
    } else {
      alert("Please log in to ChatGPT first.");
    }
  });
}
