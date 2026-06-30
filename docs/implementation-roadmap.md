# Implementation Roadmap

This roadmap tracks the commercial frontend without crossing the clean-room
boundary. Historical implementation phases are kept short here so the document
stays useful for current work.

## Phase 0: Clean-Room Foundation

Status: Complete

- Independent repository structure established.
- Clean-room source rules documented in `docs/clean-room-policy.md`.
- Backend communication is documented as protocol, not copied frontend logic.
- Provenance scan is part of `bun run verify`.

## Phase 1: Protocol And Runtime

Status: Complete

- Session-aware API client implemented with `credentials: include`.
- Business envelope errors normalize to frontend exceptions.
- Auth store supports login, refresh, and logout.
- Route guards protect authenticated user routes and commercial `/admin`
  routes.
- Typed API modules exist for user console and commercial admin protocol
  surfaces.

## Phase 2: User Console

Status: Implemented

- Overview loads current quota, usage summary, logs, and platform status.
- API Keys support list, search, create, edit, reveal, and delete.
- Wallet supports balance, billing records, redemption, and confirmed payment
  provider entry points.
- Logs support usage, drawing, and task tabs with filters, pagination, and modal
  details.
- Analytics supports model call analysis, traffic flow, and user statistics from
  usage records.
- Profile displays account information and supports confirmed account actions.
- Playground runs non-streaming session chat requests through
  `/pg/chat/completions`.

## Phase 3: Commercial UI Polish

Status: Active

- User console uses the current System Console visual direction.
- Page-level titles live in the app top bar.
- Creation and settings flows use shared modals.
- Logs detail opens as a viewport-centered modal.
- API Keys and Logs list surfaces share a structured table-card language.
- Remaining work is responsive QA, copy polish, and consistency passes after
  each feature change.

## Phase 4: Admin Strategy

Status: Active

Current product behavior:

- The ordinary user console does not use the commercial `/admin` rewrite as its
  top-right Admin button target.
- Admin users are handed off to the original default-theme admin UI.
- The default original admin path is `/channels`.
- `PUBLIC_LEGACY_ADMIN_URL` can override the admin handoff target.

Commercial clean-room admin rewrite:

- A clean-room admin rewrite exists under `src/pages/admin`.
- It was built from documented backend protocol and remains available for
  protocol testing or future productization.
- Its smoke checklist lives in `docs/admin-mvp-smoke-test.md`.
- It should not be confused with the current user-console Admin handoff.

## Phase 5: Release Hardening

Status: Active

- Keep `bun run verify` passing.
- Keep dependency notices current in `docs/third-party-notices.md`.
- Keep deployment guidance aligned with `PUBLIC_API_BASE_URL`,
  `DEV_BACKEND_ORIGIN`, and `PUBLIC_LEGACY_ADMIN_URL`.
- Run `docs/integration-qa.md` against the target backend.
- Complete `docs/release-checklist.md` before shipping.

## Deferred Or Product-Decision Items

- 2FA login completion UI after final response contract confirmation.
- OAuth login buttons.
- Registration and password reset pages.
- Streaming Playground responses.
- Creem checkout.
- Waffo Pancake checkout.
- Future product decision on whether the clean-room commercial admin rewrite
  becomes the primary admin surface again.
