(() => {
  const status = document.querySelector("[data-platform-status]") || document.getElementById("paddle-status");
  const buyButtons = [...document.querySelectorAll("[data-buy]")];
  const platformButtons = [...document.querySelectorAll("[data-platform]")];

  const platforms = {
    windows: {
      label: "Windows",
      available: true,
      priceId: () => window.PADDLE_WINDOWS_PRICE_ID || window.PADDLE_PRICE_ID,
      status: "Windows build · ready"
    },
    macos: {
      label: "macOS",
      available: false,
      priceId: () => window.PADDLE_MACOS_PRICE_ID,
      status: "macOS build · coming soon"
    },
    linux: {
      label: "Linux",
      available: false,
      priceId: () => window.PADDLE_LINUX_PRICE_ID,
      status: "Linux build · coming soon"
    }
  };

  let selectedPlatform = "windows";

  function showStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.classList.add("show");
    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => status.classList.remove("show"), 4500);
  }

  function configured() {
    const token = window.PADDLE_CLIENT_TOKEN;
    const priceId = platforms[selectedPlatform]?.priceId?.();
    return Boolean(
      token &&
      !token.includes("PASTE_YOUR_") &&
      priceId?.startsWith("pri_")
    );
  }

  function syncPlatformUI() {
    const platform = platforms[selectedPlatform];
    platformButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.platform === selectedPlatform);
      const unavailable = !platforms[button.dataset.platform]?.available;
      button.setAttribute("aria-disabled", unavailable ? "true" : "false");
    });

    if (status) {
      status.textContent = platform.status;
      if (!platform.available) {
        status.classList.add("show");
      }
    }

    buyButtons.forEach((button) => {
      button.disabled = !platform.available;
      button.setAttribute("aria-disabled", platform.available ? "false" : "true");
      button.title = platform.available ? "Buy Bezel Notes for Windows" : `${platform.label} version coming soon`;
    });
  }

  function selectPlatform(platform) {
    if (!platforms[platform]) return;
    selectedPlatform = platform;
    syncPlatformUI();
  }

  function openCheckout() {
    const platform = platforms[selectedPlatform];

    if (!platform.available) {
      showStatus(`${platform.label} support is coming soon. Windows is ready now.`);
      return;
    }

    if (!configured()) {
      showStatus("Checkout is not configured yet. Add the Paddle client-side token in config.js.");
      return;
    }

    if (!window.Paddle) {
      showStatus("Checkout is still loading. Please try again in a moment.");
      return;
    }

    const priceId = platform.priceId();
    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }]
      });
    } catch (error) {
      console.error("Paddle checkout error:", error);
      showStatus("Checkout could not be opened. Please try again.");
    }
  }

  platformButtons.forEach((button) => {
    button.addEventListener("click", () => selectPlatform(button.dataset.platform));
  });

  buyButtons.forEach((button) => {
    button.addEventListener("click", openCheckout);
  });

  window.addEventListener("load", () => {
    syncPlatformUI();

    if (!window.Paddle || !window.PADDLE_CLIENT_TOKEN) return;

    window.Paddle.Initialize({
      token: window.PADDLE_CLIENT_TOKEN,
      eventCallback(event) {
        if (event?.name === "checkout.completed") {
          showStatus("Payment complete. Your Bezel Notes purchase is being prepared.");
        }
      }
    });
  });
})();
