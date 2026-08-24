# Migrating CampVenture from Heroku to Vercel

**Date:** 2026-08-24
**Status:** Approved design, pending implementation plan

## Context

CampVenture is an Express 4 + EJS server-rendered app with Passport sessions,
MongoDB (Atlas) via Mongoose, and Cloudinary-backed image uploads. It was
deployed on Heroku at `guarded-brook-77953-c2f2c375b2e1.herokuapp.com`.

**That Heroku app no longer exists.** The hostname returns Heroku's "No such
app" error page, and the repository has no `Procfile`, no `heroku` git remote,
and no Heroku CLI installed. Nothing needs to be torn down in code; the only
surviving traces are two stale links (`README.md:7`, `README.md:30`) and a
stale server URL (`openapi.json:13`).

Any leftover billing, dynos, or add-ons must be checked by the account owner in
the Heroku dashboard. That is outside what this repository can see.

## Goal

Run the same application on Vercel, deployed automatically from GitHub, with no
functional regressions beyond one accepted limitation (below).

## The central constraint

Vercel runs **functions**, not a long-lived process. `app.listen()` never
executes. Everything below follows from that.

A second consequence: Vercel caps request bodies at **4.5 MB**. The new/edit
campground form accepts `upload.array('image', 10)` (`routes/campground.js:14`,
`routes/campground.js:35`). A multi-image upload over that ceiling will fail
with HTTP 413 before Multer streams anything to Cloudinary.

**Decision: accept this limitation.** Single and small images work normally.
Revisiting it later means either browser-side compression or signed
direct-to-Cloudinary uploads; neither is in scope here.

## Architecture

Approach chosen: **CDN-served static assets + one catch-all function.**

```
Request
  |
  +-- /stylesheets/**, /javascript/**, /default-image.jpg
  |     -> Vercel Edge Network (static, cached, no function invoked)
  |
  +-- everything else
        -> api/index.js -> Express app -> EJS render
```

`public/` already serves at the site root (`/stylesheets/css/style.css`), so it
maps onto Vercel's static output directory without changing a single asset
reference in the templates.

The rejected alternative was routing *all* traffic through Express and letting
`express.static` continue serving assets. Simpler, but every stylesheet request
would wake a function. Falling back to it later is a three-line `vercel.json`
change.

### Files added

**`api/index.js`** — the function entry point:

```js
module.exports = require('../app');
```

**`vercel.json`**:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "outputDirectory": "public",
  "functions": {
    "api/index.js": {
      "includeFiles": "{views/**,openapi.json}",
      "maxDuration": 30
    }
  },
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

`includeFiles` is **required, not optional**. Vercel's Node runtime decides
what to bundle by statically tracing `require()` calls. EJS templates are opened
by path at runtime, so nothing traces them — without this line every page render
fails with `Failed to lookup view`. The same applies to `openapi.json`, which
`app.js:44` serves by path.

**`.vercelignore`** — keep `screenshots/`, `.playwright-mcp/`, and `docs/` out
of the function bundle.

### Changes to `app.js`

| Change | Reason |
|---|---|
| Guard `app.listen()` behind `require.main === module`; `module.exports = app` | Vercel imports the app; it must not bind a port. Keeps `npm start` / `npm run dev` working locally. |
| Cache the Mongoose connection across invocations | Without it every cold start opens a fresh Atlas connection and exhausts the pool. |
| `app.set('trust proxy', 1)` | Express sits behind Vercel's proxy; otherwise `req.protocol`, `req.ip`, and secure-cookie logic are wrong. |
| `dotenv` path → `path.join(__dirname, 'config/config.env')`, no-op when absent | The current relative path resolves against CWD; `config/` is gitignored and absent in the function. |

### Incidental fixes in code being touched

These are defects in the lines this migration already modifies, not unrelated
refactoring:

- **`SECRET` has no value in production.** `app.js:59` falls back to the
  hardcoded `'thisshouldbeabettersecret'`, which is what has been encrypting
  session cookies. A generated 32-byte secret goes into Vercel env.
- **`saveUninitialized: true`** (`app.js:79`) writes a MongoDB session document
  for every anonymous visitor. Wasteful on a persistent server, worse on
  per-request serverless. Change to `false`.
- **`cookie.expires`** (`app.js:81`) is a number where `express-session` expects
  a `Date`. `maxAge` on the next line already expresses the intent correctly;
  drop `expires`.

## Environment variables

Set in **Production + Preview**. Vercel scopes every variable to Production,
Preview, and/or Development independently; a variable missing from Preview is
simply undefined there.

| Variable | Sensitive |
|---|---|
| `MONGODB_URL` | yes |
| `CLOUDINARY_SECRET_KEY` | yes |
| `SECRET` (newly generated) | yes |
| `CLOUDINARY_CLOUD_NAME` | no |
| `CLOUDINARY_API_KEY` | no |
| `MAPBOX_TOKEN` | no — publishable `pk.` token, already client-visible |

**Deliberately not set on Vercel:**

- **`NODE_ENV`** — the local `config.env` contains `NODE_ENV = DEVELOPMENT`.
  Copying it over sends `app.js:17-19` down the development branch, pointing at
  `mongodb://localhost:27017/yelpcamp`, which does not exist in a function.
  Vercel sets `NODE_ENV=production` automatically.
- **`SEED_*`, `UNSPLASH_*`** — consumed only by `npm run seed`, run locally.
  Shipping them to production is unnecessary exposure.

Env var edits do not affect already-running deployments; a redeploy is required.

### Commands

```bash
# Generate the session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Link this directory to a Vercel project
vercel link

# Add a variable (prompts for value and scope)
vercel env add MONGODB_URL

# Verify what is set
vercel env ls

# Pull Development-scoped values into a local file
vercel env pull .env.local
```

## Required manual step: MongoDB Atlas

Vercel functions have **dynamic egress IPs**. Atlas must allow `0.0.0.0/0` under
Network Access, or every database call hangs until the function times out.

This is the most likely cause of a deploy that builds cleanly and then 500s on
every page, and it cannot be done from the repository.

## Deployment

GitHub integration on `aimxnaim/CampVenture`: pushes to `main` deploy to
production, pull requests get preview URLs. This mirrors the previous Heroku
workflow.

## Documentation updates

The production URL is assigned by Vercel at first deploy, so these edits happen
after the deployment exists, not before:

- `README.md:7` — badge link to the Vercel URL
- `README.md:30` — "Deployed on Heroku" to Vercel
- `openapi.json:13` — server URL to the Vercel deployment

## Verification

Each of these must be observed, not assumed:

1. Build succeeds and the deployment goes live.
2. `/` renders — proves `includeFiles` bundled the EJS views.
3. A stylesheet loads from the CDN and does **not** invoke a function — proves
   the static/rewrite precedence in `vercel.json` behaves as designed. **This is
   the assumption most likely to be wrong**; if static files are swallowed by
   the catch-all rewrite, fall back to letting `express.static` serve them.
4. Campground list renders — proves Atlas connectivity and the allowlist.
5. Register, log out, log back in — proves sessions persist across separate
   function invocations, the real test of the serverless session store.
6. Create a campground with one small image — proves Cloudinary upload works
   within the body limit.
7. `/api-docs` renders — proves `openapi.json` was bundled.

## Out of scope

- Uploads above 4.5 MB (accepted limitation)
- Custom domain
- Any change to application features, styling, or data model
