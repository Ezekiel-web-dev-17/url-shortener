// #### URL SHORTENING API LANDING PAGE #### //
const nav = document.querySelector(".link-btn");
document.querySelector(".hamburger").addEventListener("click", () => {
  nav.classList.toggle("height");
});

document.querySelectorAll(".link-btn li").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("height");
  });
});

document.querySelectorAll(".link-btn button").forEach((btn) => {
  btn.addEventListener("click", () => {
    nav.classList.remove("height");
  });
});

document.getElementById("url-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent form from submitting normally

  const urlInput = document.getElementById("url-input");
  const url = urlInput.value.trim();

  if (!url) {
    showError("Please add a link");
    return;
  }

  shortenUrl(url);
});

async function shortenUrl(longUrl) {
  try {
    // Show loading state
    document.getElementById("shorten-btn").textContent = "Shortening...";

    // Make the API request
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    );

    if (!response.ok) {
      throw new Error("Failed to shorten URL");
    }

    const data = await response.text();

    // Display the shortened URL
    return displayResult(longUrl, data);
  } catch (error) {
    showError(error.message || "Something went wrong");
  } finally {
    // Reset button text
    document.getElementById("shorten-btn").textContent = "Shorten It!";
  }
}

function displayResult(originalUrl, shortUrl) {
  const resultsSection = document.querySelector(".results");

  // Create result element
  const resultElement = document.createElement("div");
  resultElement.className = "result-item";

  resultElement.innerHTML = `
        <div class="original-url">${originalUrl
          .toString()
          .slice(0, 28)}...</div>
        <div class="shortened-url">
            <a href="https://${shortUrl}" target="_blank">${shortUrl}</a>
            <button class="copy-btn">Copy</button>
        </div>
    `;

  // Add to the top of results
  resultsSection.prepend(resultElement);

  // Clear input
  document.getElementById("url-input").value = "";

  // Add event listener to the new copy button
  resultElement
    .querySelector(".copy-btn")
    .addEventListener("click", copyToClipboard);
}

function copyToClipboard(e) {
  const button = e.target;
  const shortUrl = button.previousElementSibling.textContent;

  // Copy to clipboard
  navigator.clipboard
    .writeText(shortUrl)
    .then(() => {
      // Change button text and style temporarily
      button.textContent = "Copied!";
      button.style.backgroundColor = "hsl(257, 27%, 26%)";

      // Reset after 2 seconds
      setTimeout(() => {
        button.textContent = "Copy";
        button.style.backgroundColor = "";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

function showError(message) {
  const errorElement = document.querySelector(".error-message");
  const inputElement = document.getElementById("url-input");

  errorElement.textContent = message;
  inputElement.classList.add("error");

  // Remove error after 3 seconds
  setTimeout(() => {
    errorElement.textContent = "";
    inputElement.classList.remove("error");
  }, 3000);
}

// Add to displayResult function
function saveToLocalStorage(originalUrl, shortUrl) {
  let urls = JSON.parse(localStorage.getItem("shortenedUrls")) || [];
  urls.unshift({ originalUrl, shortUrl });
  localStorage.setItem("shortenedUrls", JSON.stringify(urls));
}

// Add on page load to display previous results
document.addEventListener("DOMContentLoaded", () => {
  const urls = JSON.parse(localStorage.getItem("shortenedUrls")) || [];
  urls.forEach((url) => {
    displayResult(url.originalUrl, url.shortUrl);
  });
});
