# Big Shanty Auction

Welcome to the Big Shanty Auction site: the public-facing auction page, plus a private backstage area where an admin can edit it without wrestling raw HTML. GrapesJS does the dragging; you keep the gavel.

## Start the site

You’ll need Node.js and pnpm. First, make a local environment file:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set:

- `ADMIN_EMAIL` — the email address used to sign in.
- `ADMIN_PASSWORD_HASH` — a salted hash of your admin password (not the password itself).
- `SESSION_SECRET` — a random secret used to sign the login session.
- `SITE_URL` — the production site origin (for example, `https://your-domain.com`). Set this before deployment so canonical links, social previews, structured business data, and the sitemap use the real domain. Leave it blank for local development.

### Make the password hash

In PowerShell, run this command. It prompts for the password without putting it in your command history, then prints the hash to paste after `ADMIN_PASSWORD_HASH=` in `.env.local`.

```powershell
$password = Read-Host "Admin password" -AsSecureString
$plain = [System.Net.NetworkCredential]::new("", $password).Password
$env:ADMIN_PASSWORD = $plain
node -e "const c=require('node:crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync(process.env.ADMIN_PASSWORD,Buffer.from(s,'hex'),64).toString('hex'))"
Remove-Item Env:ADMIN_PASSWORD
```

Generate a `SESSION_SECRET` (at least 32 characters) with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Now launch the site:

```powershell
pnpm install
pnpm dev
```

Visit `/` for the auction page, `/login` to sign in, and `/admin/editor` to edit the home page. The editor links let you switch between Home, About, Team, and Contact. **Save Draft** saves your work for later without changing the public page; **Publish** sends it live. The internet does not get to see your half-finished masterpiece.

## What gets saved

Drafts and published page snapshots for Home, About, Team, and Contact are written to `.data/pages.json`. Saves survive a normal restart as long as that file and its disk survive too. This is local, single-instance storage—not a cloud backup, and not a good fit for serverless or multi-instance hosting. Before deploying somewhere like that, move the page data to durable shared storage.

The original page content is seeded from `lib/page-seed.json`; its image lives at `public/assets/auction-photo.png`. There’s no image-upload feature yet, so use stable assets already served from `public`.

## A few safety rails

- Admin access is configured through environment variables; there are no built-in default credentials.
- Login uses a server-side scrypt password hash and an HTTP-only, HMAC-signed session cookie that expires after 12 hours.
- Public rendering removes scripts and unsafe markup, and keeps saved CSS scoped to the landing page so an edit doesn’t accidentally redecorate the whole app.
- Search crawlers can index the public auction page; admin and login routes are marked no-index. The home page includes local-business structured data, social-share metadata, and a sitemap/robots setup. Set `SITE_URL` to the real production origin, then submit `/sitemap.xml` in Google Search Console—crawlers are good, but they still appreciate directions.

## Handy commands

```powershell
pnpm dev     # Start the local development server
pnpm lint    # Check for lint issues
pnpm build   # Build for production
pnpm start   # Serve a production build
```

## Syncing page content with Neon

The public site renders the **published** snapshots stored in the `site_pages` table in Neon — editing `lib/page-seed.json` alone won't change the live page. Edit the database copy instead:

```powershell
pnpm db:pull                          # Download DB pages to .data/pages.json (backs up the old file to .data/pages.json.bak)
# ... edit .data/pages.json locally ...
pnpm db:push --slug=home --dry-run    # Validate without writing
pnpm db:push --slug=home              # Overwrite one page in the DB (asks for YES first)
pnpm db:push                          # Overwrite every page in .data/pages.json (asks for YES first)
```

`db:push` is a force-push: it lists the pages, reminds you to pull first, and only proceeds when you type `YES` (pass `--yes` to skip the prompt in automation). Pull first if anyone may have edited via `/admin/editor`.
