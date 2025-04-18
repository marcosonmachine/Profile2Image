document.getElementById("generate").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  extractAndSendData();
});

document.addEventListener("DOMContentLoaded", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Extract username from tab URL
  const vkProfileRegex = /^https?:\/\/vk\.(com|ru)\/([A-Za-z0-9_.-]+)$/;
  const match = tab.url.match(vkProfileRegex);
  const username = match ? match[2] : "Unknown";

  // Inject script to scrape name and last seen
  if (match) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getVKProfileData,
      args: [username], // Pass username to the function
    });
  }
});

// Function to update UI with extracted name and status
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateUI") {
    document.querySelector(".content").innerHTML = `
      <strong>${request.fullname}</strong>
      <br>
      <small style="color: #6b6b57;">${request.lastSeen}</small>
      <br>
      <small style="color: #a6a6a6;">@${request.username}</small>
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

// Function to extract posts, generate XML & open ChatGPT
function extractAndSendData() {
  const xmlOutput = generateXML(); // Generate XML prompt

  chrome.storage.local.set({ generatedPrompt: xmlOutput }, () => {
    chrome.runtime.sendMessage({ action: "insertPromptToChatGPT" });
  });
}

// Function to escape XML characters
function escapeXml(unsafe) {
  return unsafe.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c],
  );
}

// Function to extract posts & generate XML (isolated scope)
function generateXML() {
  let posts = [];
  document.querySelectorAll(".PostContentContainer").forEach((div) => {
    let text = div.innerText.trim();
    if (text) {
      posts.push(`<post>${escapeXml(text)}</post>`);
    }
  });

  return `
  <?xml version="1.0" encoding="UTF-8"?>
  <MCP_PostData>
    <Posts>
      ${posts.join("\n      ")}
    </Posts>
    <ImagePrompt>
      Using the following posts, generate an AI-powered visual representation of this individual.
    </ImagePrompt>
  </MCP_PostData>
  `.trim();
}
