# RbxTradeHub — GitHub Pages Demo

A responsive Roblox-inspired social trading prototype with a social feed, game filters, listing creation, profiles, vouches, messaging, notifications, and a simulated middleman ticket workflow.

## Deploy on GitHub Pages (mobile or desktop)

1. Create a new **public** GitHub repository, e.g. `RbxTradeHub`.
2. Upload **index.html** to the repository root (not inside a subfolder). Optionally upload this README and `.nojekyll`.
3. Open **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
5. When GitHub finishes deployment, open `https://YOUR-USERNAME.github.io/RbxTradeHub/`.

## Files
- `index.html`: complete standalone application (HTML, CSS and JavaScript embedded)
- `README.md`: this guide
- `.nojekyll`: avoids unnecessary Jekyll processing

## Important limitations
- **Demo only**: data is mock data and user changes are saved locally in the browser using localStorage, not shared across devices.
- There is no real sign-in, Roblox username verification, server-backed reputation, actual escrow, or realtime multi-user chat.
- Demo middleman badges are not proof of real-world identity. Never request Roblox passwords, cookies, recovery codes, or off-site payments.
- Game trading availability, item rules, and platform policies can change. Review the rules of each game and Roblox before facilitating trades. Cross-game or real-money transactions may violate game/platform rules.
- Before production, add a backend (e.g. Supabase or Firebase), server-side authorization and moderation, verified identities, audit trails, rate limiting, abuse reports, and admin-controlled middleman assignment.

## Game selector
The game selector includes a curated, non-exhaustive list of games associated with trading. Inclusion is not a guarantee that trading is currently available or permitted in every game or region.

Grow a Garden is included in the game filter and has a sample marketplace listing.
