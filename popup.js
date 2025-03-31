document.getElementById("generate").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if the URL matches a VK profile pattern
  const vkProfileRegex = /^https?:\/\/vk\.(com|ru)\/([A-Za-z0-9_.-]+)$/;
  const match = tab.url.match(vkProfileRegex);
  console.log(match);

  if (match) {
    // Inject content script to scrape name
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getVKProfileData,
    });
  }
});

// Function to update UI with extracted name

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateUI" && request.username && request.fullname) {
    document.querySelector(".content").innerHTML = `
      <strong>${request.fullname}</strong>
      <br>
      <small style="color: #6b6b57;">${request.lastSeen}</small>
    `;
  }
});

function getVKProfileData() {
  let username = window.location.pathname.split("/")[1]; // Extracts username from URL

  // Extract the name element
  let nameElement = document.querySelector("#owner_page_name");
  let lastSeenElement = nameElement?.querySelector(
    "span.vkuiVisuallyHidden__host",
  );

  // Remove last seen from name text
  let fullname = nameElement
    ? nameElement.childNodes[0].textContent.trim()
    : "Unknown User";
  let lastSeen = lastSeenElement
    ? lastSeenElement.innerText.trim()
    : "Last seen status unavailable";

  // Send data back to popup.js
  chrome.runtime.sendMessage({
    action: "updateUI",
    username: username,
    fullname: fullname,
    lastSeen: lastSeen,
  });
}
