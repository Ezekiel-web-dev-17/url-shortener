let lastRequestTime = 0;

async function shortenUrl(longUrl) {
  try {
    const response = await fetch("https://cleanuri.com/api/v1/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(longUrl)}`,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Inside shortenUrl()
    if (data.error) {
      const userFriendlyErrors = {
        "Invalid URL format":
          "Please enter a valid URL (e.g., https://example.com)",
        "Rate limit exceeded": "Too many requests. Please wait a minute.",
      };
      throw new Error(userFriendlyErrors[data.error] || data.error);
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastRequestTime;

    // If last call was < 12 seconds ago, wait
    if (timeSinceLastCall < 12000) {
      await new Promise((resolve) =>
        setTimeout(resolve, 12000 - timeSinceLastCall)
      );
    }

    lastRequestTime = Date.now();

    return displayResult(longUrl, data.result_url); // The shortened URL
  } catch (error) {
    console.error("Shortening failed:", error);
    throw error; // Re-throw for error handling in the UI
  }
}

function displayResult(originalUrl, shortUrl) {
  const resultElement = document.createElement("div");
  resultElement.className = "url-result";

  resultElement.innerHTML = `
    <div class="original-url">${originalUrl}</div>
    <div class="shortened-url">
      <a href="${shortUrl}" target="_blank">${shortUrl}</a>
      <button class="copy-btn">Copy</button>
    </div>
  `;

  // Add copy functionality
  const copyBtn = resultElement.querySelector(".copy-btn");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 2000);
    });
  });

  // Prepend to results container (newest on top)
  resultsContainer.prepend(resultElement);
}

function saveToHistory(longUrl, shortUrl) {
  const history = JSON.parse(localStorage.getItem("urlHistory") || "[]");
  history.unshift({ longUrl, shortUrl, date: new Date().toISOString() });
  localStorage.setItem("urlHistory", JSON.stringify(history));
}

// Load history on page load
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("urlHistory") || "[]");
  history.forEach((entry) => {
    displayResult(entry.longUrl, entry.shortUrl);
  });
}

// Call this when the page loads
window.addEventListener("DOMContentLoaded", loadHistory);
