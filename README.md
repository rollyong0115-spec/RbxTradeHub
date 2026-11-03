# RbxTradeHub — Login Edition

Static GitHub Pages website with Supabase email authentication. Existing marketplace and middleman features remain local demo features (not shared between users). Do not treat demo badges as verified identities or the middleman workflow as real escrow.

## Setup on Android

1. Copy your project's **publishable** key from Supabase > Project Settings > API Keys. It begins with `sb_publishable_`. Never use the secret key or database password.
2. The Supabase Project URL and publishable key are already configured in `supabase-config.js`. No editing is needed.
3. In Supabase > Authentication > URL Configuration, set Site URL to `https://rollyong0115-spec.github.io/RbxTradeHub/` and add the same URL to Redirect URLs.
4. In Supabase > Authentication > Providers > Email, enable email/password sign-ins. Leave email confirmation enabled for production.
5. On GitHub repository `rollyong0115-spec/RbxTradeHub`, upload **index.html**, **auth.js**, **supabase-config.js**, and **README.md** individually to the repository root (not the ZIP). Replace existing files and commit to main.
6. Wait for GitHub Pages deployment and open `https://rollyong0115-spec.github.io/RbxTradeHub/`.
7. Tap Create account, enter display name, email, password (8+ characters), and check your email for the verification link. Return to the site and log in.

### Editing configuration directly on GitHub

After uploading, open `supabase-config.js` in the repository, tap the pencil Edit icon, replace the placeholder, and commit to `main`.

### Troubleshooting

- "Configure Supabase before publishing": key placeholder not replaced or config file missing.
- 404: check all files are in repository root and GitHub Pages deployment finished.
- Invalid API key: check that you pasted the entire `sb_publishable_` key, not a secret key.
- Confirmation email redirects incorrectly: update Supabase Authentication > URL Configuration.
- Signup email not arriving: check spam, Supabase Auth logs and email provider limits.

### Security

GitHub Pages files are public. Publishable keys are intended to be public, but data access must be protected with Supabase Row Level Security (RLS) and appropriate policies. Never add privileged keys to the website. Production marketplace posts, chat, and verified middleman features need separate secure database policies, authorization and moderation.
