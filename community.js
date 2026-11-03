
/*
 RbxTradeHub V2 — Community Edition
 Real public listings and profiles via Supabase.
 Requires supabase-config.js and Supabase Auth.
*/

(() => {
  "use strict";

  const GAMES = [
    "Grow a Garden",
    "Adopt Me",
    "Blox Fruits",
    "Pet Simulator 99",
    "Murder Mystery 2",
    "Royale High",
    "Jailbreak",
    "Dragon Adventures",
    "Creatures of Sonaria",
    "Islands",
    "Dungeon Quest",
    "World // Zero",
    "Bubble Gum Simulator INFINITY",
    "Steal a Brainrot",
    "Blade Ball",
    "Anime Defenders",
    "Anime Last Stand",
    "Pet Simulator X",
    "Flee the Facility",
    "Survive the Killer!",
    "Assassin!",
    "Lumber Tycoon 2",
    "Toilet Tower Defense"
  ];

  const CATEGORIES = [
    "Trading",
    "Looking For",
    "Cross-Trading",
    "Middleman Needed"
  ];

  // Demo listings are clearly identified as samples.
  const DEMOS = [
    {
      game: "Grow a Garden",
      category: "Trading",
      offering: "Garden pets",
      looking_for: "Other garden pets",
      price: "Item for item"
    },
    {
      game: "Blox Fruits",
      category: "Looking For",
      offering: "Trade offer",
      looking_for: "Blox Fruits items",
      price: "Negotiable"
    },
    {
      game: "Adopt Me",
      category: "Trading",
      offering: "Adopt Me pets",
      looking_for: "Pet offers",
      price: "Item for item"
    }
  ];

  const cfg = window.RBX_SUPABASE_CONFIG;
  const factory = window.supabase?.createClient;

  if (!cfg?.url || !cfg?.key || !factory) {
    console.error("RbxTradeHub: Supabase configuration missing.");
    return;
  }

  const db = factory(cfg.url, cfg.key);
  let user = null;
  let posts = [];
  let currentFilter = "All";
  let searchText = "";
  let refreshTimer = null;

  const esc = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const $ = id => document.getElementById(id);

  const optionList = values => values
    .map(v => `<option value="${esc(v)}">${esc(v)}</option>`)
    .join("");

  function notify(message) {
    const node = $("rbx-status");
    if (node) node.textContent = message;
  }

  function renderShell() {
    if ($("rbx-community")) return;

    const style = document.createElement("style");
    style.textContent = `
      #rbx-community {
        color:#eaf2ff;
        background:#111827;
        border:1px solid #334155;
        border-radius:18px;
        padding:16px;
        margin:20px auto;
        max-width:900px;
        font-family:system-ui,sans-serif;
      }
      #rbx-community * { box-sizing:border-box; }
      #rbx-community h2 { margin:0 0 8px; }
      #rbx-community p { line-height:1.5; }
      #rbx-community input,
      #rbx-community select,
      #rbx-community textarea {
        width:100%;
        padding:12px;
        background:#1e293b;
        border:1px solid #475569;
        border-radius:10px;
        color:white;
        font:inherit;
      }
      #rbx-community label {
        display:block;
        margin:10px 0 5px;
        font-size:13px;
        color:#cbd5e1;
      }
      #rbx-community button {
        padding:11px 14px;
        background:#2563eb;
        color:white;
        border:0;
        border-radius:10px;
        font-weight:600;
        cursor:pointer;
      }
      #rbx-community button:disabled {
        opacity:.55;
        cursor:wait;
      }
      #rbx-community .rbx-card {
        background:#1e293b;
        border:1px solid #334155;
        border-radius:14px;
        padding:15px;
        margin:12px 0;
        overflow-wrap:anywhere;
      }
      #rbx-community .rbx-row {
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
        margin:12px 0;
      }
      #rbx-community .rbx-row > input,
      #rbx-community .rbx-row > select {
        flex:1;
        min-width:130px;
      }
      #rbx-community .rbx-muted {
        color:#94a3b8;
        font-size:13px;
      }
      #rbx-community .rbx-badge {
        display:inline-block;
        background:#164e63;
        color:#a5f3fc;
        padding:4px 8px;
        border-radius:20px;
        font-size:12px;
      }
      #rbx-community .rbx-demo {
        background:#713f12;
        color:#fde68a;
      }
      #rbx-community .rbx-green {
        color:#4ade80;
      }
      #rbx-community details {
        margin:12px 0;
      }
      #rbx-community summary {
        cursor:pointer;
        font-weight:600;
        padding:8px 0;
      }
      @media(max-width:600px) {
        #rbx-community { padding:12px; }
        #rbx-community .rbx-row { align-items:stretch; }
      }
    `;
    document.head.appendChild(style);

    const root = document.createElement("section");
    root.id = "rbx-community";
    root.innerHTML = `
      <h2>🌐 RbxTradeHub Community</h2>
      <p class="rbx-muted">
        Real trader profiles and public listings.
        Demo listings are marked as samples.
      </p>

      <div id="rbx-status" role="status">
        Connecting to Supabase...
      </div>

      <details id="rbx-profile-details">
        <summary>👤 My Trader Profile</summary>
        <form id="rbx-profile-form">
          <label>Display name</label>
          <input id="rbx-display-name"
                 maxlength="60" required>

          <label>Roblox username</label>
          <input id="rbx-roblox-name"
                 maxlength="60"
                 placeholder="Your Roblox username">

          <p class="rbx-muted">
            Roblox usernames entered here are not
            ownership-verified yet.
          </p>
          <button type="submit">Save Profile</button>
        </form>
      </details>

      <details>
        <summary>➕ Create Public Trading Post</summary>
        <form id="rbx-post-form">
          <label>Game</label>
          <select id="rbx-game" required>
            ${optionList(GAMES)}
          </select>

          <label>Category</label>
          <select id="rbx-category">
            ${optionList(CATEGORIES)}
          </select>

          <label>Offering</label>
          <textarea id="rbx-offering"
                    maxlength="1000" required
                    placeholder="What are you offering?"></textarea>

          <label>Looking for</label>
          <textarea id="rbx-looking"
                    maxlength="1000" required
                    placeholder="What do you want?"></textarea>

          <label>Price or value (optional)</label>
          <input id="rbx-price"
                 maxlength="100"
                 placeholder="Item for item">

          <label>
            <input id="rbx-mm" type="checkbox"
                   style="width:auto">
            Middleman requested
          </label>

          <p class="rbx-muted">
            MM requests are informational only.
            No escrow or MM assignment is active.
          </p>

          <button id="rbx-submit-post" type="submit">
            Publish Post
          </button>
        </form>
      </details>

      <div class="rbx-row">
        <input id="rbx-search"
               placeholder="Search trading posts...">
        <select id="rbx-filter">
          <option value="All">All Games</option>
          ${optionList(GAMES)}
        </select>
        <button id="rbx-refresh" type="button">
          Refresh
        </button>
      </div>

      <div id="rbx-posts"></div>
    `;

    document.body.appendChild(root);

    $("rbx-search").addEventListener("input", e => {
      searchText = e.target.value.toLowerCase();
      renderPosts();
    });

    $("rbx-filter").addEventListener("change", e => {
      currentFilter = e.target.value;
      renderPosts();
    });

    $("rbx-refresh").addEventListener("click", loadPosts);
    $("rbx-post-form").addEventListener("submit", createPost);
    $("rbx-profile-form").addEventListener("submit", saveProfile);

    $("rbx-posts").addEventListener("click", async e => {
      const button = e.target.closest("[data-delete]");
      if (!button || !user) return;

      const id = button.dataset.delete;
      if (!confirm("Delete this trading post?")) return;

      button.disabled = true;
      const { error } = await db
        .from("trade_posts")
        .delete()
        .eq("id", id)
        .eq("author_id", user.id);

      if (error) {
        notify(error.message);
        button.disabled = false;
      } else {
        await loadPosts();
      }
    });
  }

  async function loadProfile() {
    if (!user) return;

    const { data, error } = await db
      .from("trader_profiles")
      .select("display_name,roblox_username")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      notify("Profile: " + error.message);
      return;
    }

    $("rbx-display-name").value = data?.display_name || "New Trader";
    $("rbx-roblox-name").value = data?.roblox_username || "";
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!user) return notify("Please log in first.");

    const display_name = $("rbx-display-name").value.trim();
    const roblox_username = $("rbx-roblox-name").value.trim();

    if (!display_name) return notify("Enter a display name.");

    const { error } = await db
      .from("trader_profiles")
      .upsert({
        id: user.id,
        display_name,
        roblox_username
      }, { onConflict: "id" });

    if (error) return notify(error.message);

    notify("Profile saved!");
    await loadPosts();
  }

  async function createPost(e) {
    e.preventDefault();

    if (!user) return notify("Please log in first.");

    const button = $("rbx-submit-post");
    button.disabled = true;

    const payload = {
      author_id: user.id,
      game: $("rbx-game").value,
      category: $("rbx-category").value,
      offering: $("rbx-offering").value.trim(),
      looking_for: $("rbx-looking").value.trim(),
      price: $("rbx-price").value.trim(),
      mm_requested: $("rbx-mm").checked
    };

    try {
      if (!payload.offering || !payload.looking_for) {
        throw new Error("Fill in both item fields.");
      }

      const { error } = await db
        .from("trade_posts")
        .insert(payload);

      if (error) throw error;

      $("rbx-post-form").reset();
      notify("Your public trading post is live!");
      await loadPosts();
    } catch (err) {
      notify("Could not publish: " + err.message);
    } finally {
      button.disabled = false;
    }
  }

  function renderPosts() {
    const real = posts.map(p => ({
      ...p,
      demo: false,
      author: p.trader_profiles?.display_name || "Trader"
    }));

    const demos = DEMOS.map(p => ({
      ...p,
      demo: true,
      author: "Sample Trader"
    }));

    const visible = [...real, ...demos].filter(p => {
      const matchesGame =
        currentFilter === "All" || p.game === currentFilter;

      const content = [
        p.game,
        p.offering,
        p.looking_for,
        p.author,
        p.category
      ].join(" ").toLowerCase();

      return matchesGame && content.includes(searchText);
    });

    $("rbx-posts").innerHTML = visible.length
      ? visible.map(p => `
          <article class="rbx-card">
            <div class="rbx-row">
              <strong>${esc(p.author)}</strong>
              <span class="rbx-badge ${p.demo ? "rbx-demo" : ""}">
                ${p.demo ? "DEMO POST" : "PUBLIC POST"}
              </span>
            </div>

            <p class="rbx-muted">
              🎮 ${esc(p.game)} · ${esc(p.category)}
            </p>

            <p><strong>Offering:</strong>
              ${esc(p.offering)}</p>

            <p><strong>Looking for:</strong>
              ${esc(p.looking_for)}</p>

            ${p.price ? `<p>Value: ${esc(p.price)}</p>` : ""}

            ${p.mm_requested ? `
              <p class="rbx-muted">
                🛡 Middleman requested — not assigned
              </p>` : ""}

            ${p.created_at ? `
              <p class="rbx-muted">
                ${esc(new Date(p.created_at).toLocaleString())}
              </p>` : ""}

            ${!p.demo && user?.id === p.author_id ? `
              <button data-delete="${esc(p.id)}"
                      type="button">Delete Post</button>
            ` : ""}
          </article>
        `).join("")
      : `<p class="rbx-muted">No matching posts yet.</p>`;
  }

  async function loadPosts() {
    if (!user) {
      posts = [];
      renderPosts();
      return;
    }

    const { data, error } = await db
      .from("trade_posts")
      .select(`
        id,author_id,game,category,offering,
        looking_for,price,mm_requested,created_at,
        trader_profiles(display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      notify("Loading failed: " + error.message);
      return;
    }

    posts = data || [];
    renderPosts();
    notify("Community connected · " + posts.length + " public posts");
  }

  async function syncSession() {
    const { data, error } = await db.auth.getUser();
    user = error ? null : data.user;

    const root = $("rbx-community");
    if (!root) return;

    if (!user) {
      root.style.display = "none";
      return;
    }

    root.style.display = "block";
    await loadProfile();
    await loadPosts();
  }

  async function start() {
    renderShell();
    await syncSession();

    db.auth.onAuthStateChange(() => {
      // Defer queries outside the auth callback.
      setTimeout(syncSession, 0);
    });

    // Simple polling, so no Realtime configuration is required.
    refreshTimer = setInterval(() => {
      if (user && document.visibilityState === "visible") {
        loadPosts();
      }
    }, 30000);

    window.addEventListener("pagehide", () => {
      if (refreshTimer) clearInterval(refreshTimer);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
