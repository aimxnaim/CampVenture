# Rewriting CampVenture on Java and Spring Boot

**Date:** 2026-09-08
**Status:** Approved design
**Supersedes:** `2026-08-24-vercel-migration-design.md` (describes hosting the
Express app; no longer applicable)

## Context

CampVenture is a working YelpCamp-style application: Express 4 + EJS +
MongoDB/Mongoose, Passport sessions, Cloudinary image hosting, Mapbox maps. It
functions, but responsibilities are tangled — `controllers/campground.js`
performs geocoding, file upload, database writes, flash messaging, and redirects
inside single functions.

**The goal of this rewrite is not a better website. It is learning Java.** The
rewrite is the vehicle. The domain is one the author understands completely, so
all new difficulty is the language and framework rather than the requirements.

The author is starting from zero Java and near-zero React. Learning both
simultaneously makes failures ambiguous — a broken page could be a Java problem,
a React problem, or a wiring problem between them. The work is therefore split
into two stages, and only Stage 1 is designed here.

Time budget is 5–10 hours per week. Stage 1 is estimated at 55–65 hours, so
8–12 weeks.

## The two stages

**Stage 1 (this document): the whole application in Java.** Spring Boot with
Thymeleaf server-rendered pages. This is the same "server renders HTML" model as
the current EJS setup, so the view layer stays familiar and cheap while all new
learning is Java. One deployable, no CORS, no separate build, no JavaScript
framework.

**Stage 2 (later, separate design): REST API plus React.** Spring Boot can serve
HTML pages and a JSON API from the same service layer. When the author is ready,
`@RestController`s are added on top of the existing services — no business logic
is rewritten — and a React SPA is built against a real, working API. Learning
React against an API that already works is far easier than learning both at once.

The service-layer boundary described below is what makes Stage 2 cheap. It is
the most important rule in this design.

## Decisions

| Area | Choice | Rationale |
|---|---|---|
| Language | Java 21 (LTS) | Current LTS; records, pattern matching, text blocks |
| Framework | Spring Boot 3.5 | The default Java web stack; what employers ask for |
| Build | Maven | More common in enterprise codebases than Gradle; simpler to read |
| Views | Thymeleaf (Stage 1) | Closest model to the existing EJS templates |
| Database | PostgreSQL 18 | Already installed locally; forces relational modelling |
| Persistence | JPA / Hibernate + Flyway | The transferable Java data skill |
| Auth | Spring Security 6 form login | Session cookie, BCrypt, CSRF enabled by default |
| Images | Cloudinary (unchanged) | Existing account and assets; not the thing being learned |
| Maps | Mapbox (unchanged) | Existing account and working client code |
| Repo | Same repo, new `backend/` | Express app remains readable side-by-side until cutover |
| Hosting | Local only for now | Deployment is self-contained and shouldn't shape architecture |

### Rejected alternatives

- **Keeping MongoDB with Spring Data MongoDB.** Lower friction, but skips
  JPA/Hibernate — the single most requested Java persistence skill.
- **React from day one.** The originally chosen path, reversed once the author's
  React inexperience surfaced. Deferred to Stage 2 rather than dropped.
- **JWT authentication.** More moving parts (storage, refresh rotation,
  revocation) for no benefit in a server-rendered app.
- **PostGIS.** Nothing in the application performs proximity queries. Plain
  latitude/longitude columns are sufficient until a "campgrounds near me"
  feature actually exists.

## Architecture

```
CampVenture/
├── backend/            Spring Boot 3.5 — serves HTML on :8080
├── docker-compose.yml  PostgreSQL 18
├── learning/           Phase 0 Java exercises (throwaway)
└── (legacy Express app at root — deleted in Phase 9)
```

The backend is organised into **feature packages** rather than layer packages, so
each folder is one bounded concept:

```
com.campventure
├── config/       SecurityConfig
├── common/       GlobalExceptionHandler, NotFoundException, ForbiddenException, @NoHtml
├── user/         User, UserRepository, UserService, AuthController, dto/
├── campground/   Campground, CampgroundImage, ...Repository, ...Service, ...Controller, dto/
├── review/       Review, ReviewRepository, ReviewService, ReviewController, dto/
├── image/        ImageStorage (interface) + CloudinaryImageStorage
└── geocoding/    GeocodingClient (interface) + MapboxGeocodingClient
```

### Layer responsibilities

- **Controller** — HTTP in, view name out. No business logic.
- **Service** — business rules, ownership checks, transaction boundaries.
  **Knows nothing about HTTP.** No `HttpServletRequest`, no session, no redirect.
  This is what allows a `@RestController` in Stage 2 to call the same service a
  `@Controller` calls today.
- **Repository** — data access only.
- **DTO** — the form contract. Entities are never bound directly to forms or
  exposed to templates.

`ImageStorage` and `GeocodingClient` are interfaces with Cloudinary and Mapbox
implementations so that tests can substitute fakes and never touch the network.

## Data model

Mongo's embedded arrays become foreign keys. This is the central modelling change.

```sql
users              id, username UNIQUE, email UNIQUE, password_hash,
                   created_at, updated_at

campgrounds        id, title, price NUMERIC(10,2), description, location,
                   latitude, longitude, author_id → users,
                   created_at, updated_at

campground_images  id, campground_id → campgrounds ON DELETE CASCADE,
                   url, public_id, original_name, position

reviews            id, campground_id → campgrounds ON DELETE CASCADE,
                   author_id → users, body, rating SMALLINT CHECK (1..5),
                   created_at, updated_at
```

Three deliberate departures from the Mongoose schemas:

1. **`campground.reviews[]` becomes `reviews.campground_id`.** Deleting a
   campground cascades in the database, replacing the Mongoose
   `findOneAndDelete` hook at `model/campground.js:57`. The database enforces the
   invariant rather than application code remembering to.
2. **GeoJSON `geometry.coordinates` becomes `latitude` / `longitude` columns.**
   No PostGIS. Revisit only if proximity search is built.
3. **`price` is `NUMERIC(10,2)`, not a float.** Money is never a float.

Schema is managed by Flyway migrations, not Hibernate's `ddl-auto`. Versioned,
reviewable, and the same mechanism used in production Java systems.

**No data migration.** The Heroku deployment no longer exists and there is no
production data worth moving. The database is reseeded from the existing source
data (`data/malaysiaCampsite.js` — 20 Malaysian campsites with coordinates)
converted to a JSON resource read by a Java seeder behind a `seed` Spring
profile.

## Mapping from the existing application

The required behaviour is already specified — in JavaScript. These files are the
source of truth for the rewrite:

| Existing | Replacement |
|---|---|
| `model/*.js` | JPA entities + Flyway migrations |
| `controllers/*.js` | Services (logic) + Controllers (HTTP only) |
| `middleware.js` `isLoggedIn` | `SecurityConfig` URL rules |
| `middleware.js` `isAuthor` / `isReviewAuthor` | Service-layer checks throwing `ForbiddenException` |
| `schema.js` (Joi + sanitize-html) | Bean Validation DTOs + custom `@NoHtml` constraint |
| `connect-flash` | `RedirectAttributes.addFlashAttribute` |
| `express-mongo-sanitize` | Not required — JPA parameterises queries |
| `helmet` CSP | Spring Security headers configuration |
| `utils/ExpressError.js` + error middleware | `@ControllerAdvice` exception handler |
| `views/**/*.ejs` | Thymeleaf templates |
| `views/layouts/boilerplate.ejs` | Thymeleaf layout fragments |
| `public/javascript/clusterMap.js` | Unchanged — plain JS served from `static/` |
| `public/stylesheets/**` | Copied to `backend/src/main/resources/static/` |
| `data/malaysiaCampsite.js` | `resources/seed/campgrounds.json` |
| `openapi.json` (hand-written) | Deferred to Stage 2 (springdoc-openapi) |

### Security note

The current Express application has **no CSRF protection**. Thymeleaf's form tags
insert the CSRF token automatically and Spring Security verifies it, so Stage 1
closes a real vulnerability rather than merely porting behaviour.

## Phases

Phases are sized to finish in one or two evening sittings. Each ends with
something visible in a browser.

| # | Phase | Who writes | Est. |
|---|---|---|---|
| 0 | Java language fundamentals (no app code) | Author, guided | ~17h |
| 1 | Walking skeleton: Docker, Boot, Flyway, first test | Pair | ~5h |
| 2 | Reference vertical slice — campground list | Claude | ~6h |
| 3 | Campground detail page | Author | ~4h |
| 4 | Authentication | Claude | ~6h |
| 5 | Campground create / edit / delete + `@NoHtml` | Author | ~8h |
| 6 | Reviews | Author | ~6h |
| 7 | Cloudinary image upload | Pair | ~6h |
| 8 | Mapbox geocoding + cluster map | Pair | ~5h |
| 9 | Polish, pagination, cutover | Pair | ~6h |

**Phase 0 is not optional.** Spring Boot is dense with annotations, generics, and
interfaces. Without the language basics they read as magic, and every subsequent
failure becomes ambiguous.

**Phase 2 is the reference implementation.** One feature written end to end with
heavy explanatory comments, to be copied as a template for Phases 3, 5, and 6.

**Phase 4 is written by Claude by design.** Spring Security is the sharpest-edged
part of the ecosystem and a poor first solo exercise.

## Testing

- **JUnit 5 + AssertJ** throughout.
- **Testcontainers** running real PostgreSQL for repository and integration
  tests. No mocked database — the point is learning how JPA actually behaves.
- **MockMvc** for controller tests, with `@WithMockUser` for authenticated paths.
- TDD from Phase 3 onward, once JUnit is familiar from Phase 0d.

## Verification

Per phase:

```sh
cd backend && ./mvnw test                              # unit + integration
docker compose up -d && cd backend && ./mvnw spring-boot:run
```

End-to-end acceptance checklist, run manually before Phase 9:

1. Register → logged in → navbar shows the username.
2. Create a campground with two images → images reach Cloudinary, a marker
   appears on the map at the geocoded location.
3. Sign in as a second user → edit/delete controls absent on another user's
   campground; requesting those URLs directly returns **403**, not 200.
4. Leave a review → shown with author name; deleting another user's review → 403.
5. Delete a campground → its reviews and images are gone (cascade + Cloudinary).
6. Submit `<script>alert(1)</script>` as a title → rejected by `@NoHtml`,
   mirroring the XSS test captured in `screenshots/XSS Attack.png`.
7. Log out → protected pages redirect to login, session cookie cleared.

## Progress tracking

`docs/PROGRESS.md` holds a phase checklist plus a one-line note per session
recording where work stopped and what was confusing. At 5–10 hours per week
across evenings, this is what makes it possible to resume cold.
