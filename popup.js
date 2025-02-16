document.getElementById("copyCells").addEventListener("click", () => {
  const includeOutput = document.getElementById("includeOutput").checked;

  // Query the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].url.startsWith("https://colab.research.google.com/")) {
      showNotification("Work only on colab , so open colab first");
    } else {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: extractColabContent, 
          args: [includeOutput],
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            const colabContent = results[0].result; // Extracted content

            copyToClipboard(colabContent);
          } else {
            showNotification("Failed to extract Colab content.");
          }
        }
      );
    }
  });
});

// Function to extract cell content (runs in content script)
function extractColabContent(includeOutput) {
  let cells;

  if (includeOutput) {
    // Select both input and output cells
    cells = document.querySelectorAll(".cell");
  } else {
    // Select only input/code cells
    cells = document.querySelectorAll(".inputarea");
  }

  let allContent = "";

  cells.forEach((cell, index) => {
    // allContent += `Cell ${index + 1}:\n${cell.innerText.trim()}\n\n`;
    allContent += `\n${cell.innerText.trim()}`;
  });

  return allContent || "No content found!";
}

// Function to copy content to clipboard (runs in popup)
function copyToClipboard(content) {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      console.log("Copied to clipboard:", content);
      showNotification("Cell content copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showNotification("Failed to copy content. Check the console.");
    });
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";

  // Hide notification after 4 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}
