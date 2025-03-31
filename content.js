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

const posts = [];
document.querySelectorAll(".PostContentContainer").forEach((div) => {
  posts.push(`<post>${escapeXml(div.innerText.trim())}</post>`);
});

const xmlOutput = `
<?xml version="1.0" encoding="UTF-8"?>
<MCP_PostData>
  <Posts>
    ${posts.join("\n    ")}
  </Posts>
  <ImagePrompt>
    Using the following posts, generate an AI-powered visual representation of this individual.
  </ImagePrompt>
</MCP_PostData>
`.trim();

// chrome.storage.local.set({ generatedPrompt: xmlOutput }, () => {
//   chrome.runtime.sendMessage({ action: "openChatGPT" });
// });
