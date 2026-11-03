
/*
 * RbxTradeHub V2 — Feed & Community Fixes
 * Load AFTER auth.js and community.js.
 */
(function () {
  "use strict";

  // Fix existing demo-feed comments.
  // The original function forgot to save().
  window.addComment = function (event, id) {
    event.preventDefault();

    const post = state.posts.find(
      p => String(p.id) === String(id)
    );

    if (!post) {
      alert("Trading post not found.");
      return;
    }

    const input = event.currentTarget.elements.namedItem("comment");
    const message = input?.value?.trim();

    if (!message) return;

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    post.comments.push({
      user: ME || "Trader",
      text: message,
      created_at: new Date().toISOString()
    });

    // Persist comments in browser storage.
    save();

    // Update notifications and persist again.
    notify("New comment on trade post #" + id);

    // Reopen the comments panel with the new message.
    openComments(id);
  };

  function setupCommunity() {
    const community = document.getElementById("rbx-community");
    const app = document.getElementById("app");

    if (!community || !app) return;

    // Place the community below the main trading interface.
    if (community.previousElementSibling !== app) {
      app.insertAdjacentElement("afterend", community);
    }

    community.style.maxWidth = "1100px";
    community.style.width = "calc(100% - 24px)";
    community.style.margin = "24px auto 100px";

    // Add a community shortcut to the main header.
    const header = app.querySelector(".top");

    if (header && !document.getElementById("communityShortcut")) {
      const button = document.createElement("button");

      button.id = "communityShortcut";
      button.type = "button";
      button.textContent = "🌐 Community";
      button.className = "btn primary";
      button.style.whiteSpace = "nowrap";

      button.addEventListener("click", () => {
        if (community.style.display === "none") {
          alert("Please log in to access the community.");
          return;
        }

        community.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });

      header.appendChild(button);
    }
  }

  function initialize() {
    setupCommunity();

    const app = document.getElementById("app");

    if (app) {
      // Existing app recreates its header on navigation.
      // Restore the shortcut after each render.
      const observer = new MutationObserver(() => {
        setupCommunity();
      });

      observer.observe(app, {
        childList: true
      });
    }

    // Give the community script time to initialize.
    setTimeout(setupCommunity, 800);
    setTimeout(setupCommunity, 2000);

    // Show a diagnostic message if the community fails.
    setTimeout(() => {
      if (document.getElementById("rbx-community")) return;

      console.error(
        "RbxTradeHub: Community module did not initialize."
      );

      const warning = document.createElement("div");
      warning.style.cssText =
        "margin:20px auto;padding:15px;" +
        "max-width:900px;background:#422006;" +
        "color:#fde68a;border-radius:12px;";

      warning.textContent =
        "Community module could not load. " +
        "Check community.js and the browser console.";

      document.getElementById("app")
        ?.insertAdjacentElement("afterend", warning);
    }, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
