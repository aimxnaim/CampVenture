# CampVenture v2 — progress log

Stage 1: rewrite the app in Java (Spring Boot + Thymeleaf).
Design: [`superpowers/specs/2026-09-08-java-rewrite-design.md`](superpowers/specs/2026-09-08-java-rewrite-design.md)

Budget ~5–10 h/week. Estimated 55–65 h total.

## Checklist

- [ ] **0a** Install JDK 21, Maven, IntelliJ — Hello World compiles (~3h)
- [ ] **0b** Types, classes, records, interfaces (~5h)
- [ ] **0c** Collections, generics, Optional, streams, exceptions (~5h)
- [ ] **0d** JUnit 5 + AssertJ (~4h)
- [ ] **1** Walking skeleton: Docker Postgres, Spring Boot, Flyway, first test (~5h)
- [ ] **2** Reference slice — campground list *(Claude writes)* (~6h)
- [ ] **3** Campground detail page *(you write)* (~4h)
- [ ] **4** Authentication *(Claude writes)* (~6h)
- [ ] **5** Campground create / edit / delete + `@NoHtml` *(you write)* (~8h)
- [ ] **6** Reviews *(you write)* (~6h)
- [ ] **7** Cloudinary image upload *(pair)* (~6h)
- [ ] **8** Mapbox geocoding + cluster map *(pair)* (~5h)
- [ ] **9** Polish, pagination, cutover *(pair)* (~6h)

## Session log

One line per session: where you stopped, and what confused you. The second half
matters more than the first — it's what we come back to.

| Date | Phase | Stopped at | Still fuzzy |
|---|---|---|---|
| 2026-09-08 | — | Design approved, `legacy-node` tag created | — |
