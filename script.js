
const panelData = {
  product: {
    eyebrow: "01 / THE PRODUCT",
    title: "Your notes, within reach.",
    body: `<p>Bezel Notes is a sticky-note workspace that lives along the edge of your desktop. Bring it forward when you need to capture something, then return to what you were doing.</p><ul><li>Quick access from the edge of your screen</li><li>Simple sticky notes with colour and pin controls</li><li>Search to find thoughts again</li><li>Your notes stay saved locally</li></ul>`
  },
  features: {
    eyebrow: "02 / THE DETAILS",
    title: "Small tools. Less friction.",
    body: `<p>Bezel is designed to keep note-taking close without turning it into another big workflow.</p><ul><li><b>Edge-first:</b> bring the panel in without opening another app window.</li><li><b>Sticky by design:</b> pin important notes and use colour to organise them.</li><li><b>Searchable:</b> find the note you need when the list grows.</li><li><b>Persistent:</b> your notes remain available after restarting.</li></ul>`
  },
  about: {
    eyebrow: "03 / THE STORY",
    title: "Made for the in-between thoughts.",
    body: `<p>Some thoughts arrive while you're reading, building, researching or working on something else. Bezel Notes gives those thoughts a nearby place to land—without asking you to leave your flow.</p><p>Less ceremony. More doing.</p>`
  },
  pricing: {
    eyebrow: "04 / PRICING",
    title: "Buy once. Keep the edge.",
    body: `<p class="panel-price">$5.99</p><p>A one-time purchase for a lifetime license. No subscription and no recurring bill.</p><button class="panel-action" data-buy>Purchase license</button><p><small>Secure checkout integration will be connected very soon.</small></p>`
  },
  download: {
    eyebrow: "05 / DOWNLOAD",
    title: "Bring Bezel to your desktop.",
    body: `<p>The Windows build is currently available. macOS and Linux builds will be added very soon.</p><button class="panel-action" id="download-action">Download for Windows</button><p><small>Downloads the latest Windows installer from the project's GitHub release.</small></p>`
  },
  faq: {
    eyebrow: "06 / GOOD TO KNOW",
    title: "A few quick answers.",
    body: `<p><b>Is it a subscription?</b><br>No. The planned launch price is a one-time $5.99 lifetime license.</p><p><b>Where are notes stored?</b><br>Notes are stored locally on your device.</p><p><b>Which platforms are ready?</b><br>The Windows build is available. Other platform builds are coming as they are prepared.</p><p><b>How do updates work?</b><br>Bezel can discover releases from within the app.</p>`
  }
};

const overlay = document.getElementById("info-overlay");
const closeButton = document.getElementById("panel-close");
const title = document.getElementById("panel-title");
const eyebrow = document.getElementById("panel-eyebrow");
const content = document.getElementById("panel-content");
let lastFocused = null;

function openPanel(key) {
  const data = panelData[key];
  if (!data) return;

  lastFocused = document.activeElement;
  eyebrow.textContent = data.eyebrow;
  title.textContent = data.title;
  content.innerHTML = data.body;
  overlay.hidden = false;
  closeButton.focus();
}

function closePanel() {
  overlay.hidden = true;
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll("[data-panel]").forEach((object) => {
  object.addEventListener("click", () => openPanel(object.dataset.panel));
});

closeButton.addEventListener("click", closePanel);

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closePanel();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) {
    closePanel();
  }
});

content.addEventListener("click", (event) => {
  if (event.target.matches("[data-buy]")) {
    event.preventDefault();
    event.target.textContent = "Checkout coming soon";
    event.target.disabled = true;
  }

  if (event.target.id === "download-action") {
    downloadLatestWindowsBuild(event.target);
  }
});

async function downloadLatestWindowsBuild(button) {
  const original = button.textContent;

  button.disabled = true;
  button.textContent = "Checking latest release…";

  try {
    const response = await fetch(
      "https://api.github.com/repos/celestial4919/bezel-notes/releases/latest"
    );

    if (!response.ok) {
      throw new Error("Could not fetch release details.");
    }

    const release = await response.json();

    const asset = release.assets.find((item) =>
      /\.(exe|msi)$/i.test(item.name)
    );

    if (!asset) {
      throw new Error("No Windows installer found in the latest release.");
    }

    const link = document.createElement("a");
    link.href = asset.browser_download_url;
    link.download = "";

    document.body.appendChild(link);
    link.click();
    link.remove();

    button.textContent = "Download started";
  } catch (error) {
    button.textContent = "Try again";
    button.title = error.message;
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = original;
    }, 2500);
  }
}
