# Integration QA

Use this guide when connecting the commercial frontend to a real backend.

## Preflight

- Confirm backend is reachable from the browser.
- For local development, prefer `PUBLIC_API_BASE_URL=` and
  `DEV_BACKEND_ORIGIN=http://localhost:3000` so Rsbuild proxies `/api`, `/pg`,
  `/v1`, and `/mj`.
- Set `PUBLIC_LEGACY_ADMIN_URL=http://localhost:3000/channels` when the
  user-console Admin button should open the original default-theme admin UI.
- In dev proxy mode, `PUBLIC_API_BASE_URL` must be empty. If it points directly
  to the backend, login may succeed while `/api/user/self` returns 401 because
  the session cookie belongs to a different origin.
- Use direct `PUBLIC_API_BASE_URL` only when backend CORS and cross-site cookies
  are already configured correctly.

## Login 200 But `/api/user/self` 401

This means the username/password passed, but the session cookie did not come
back on the next request.

Check:

- Request URL in DevTools should be `/api/user/login`, not
  `http://backend-origin/api/user/login`.
- `.env` should contain `PUBLIC_API_BASE_URL=` when using dev proxy.
- `.env` should contain the backend only in `DEV_BACKEND_ORIGIN`.
- Restart `bun run dev` after editing `.env`.
- The `/api/user/login` response should include `Set-Cookie: session=...`.
- The `/api/user/self` request should include `Cookie: session=...`.
- Confirm dashboard session cookies work with `credentials: include`.
- Confirm backend CORS allows the frontend origin for cross-origin deployment.

## Smoke Test

1. Open `/login`.
2. Sign in with a test user.
3. Confirm `/overview` loads account quota and platform status.
4. Confirm platform system name, logo, browser title, and favicon reflect
   `/api/status`.
5. Open `/api-keys` and list keys.
6. Create a test key with group, expiry, quantity, unlimited quota, and finite
   USD quota variants. Reveal it, edit it, then delete it.
7. Open `/wallet` and confirm balance, payment availability, and records load.
8. Test redemption in a non-production environment.
9. Test payment redirects only with sandbox provider credentials.
10. Open `/logs` and switch usage, drawing, and task tabs.
11. Apply and clear log filters.
12. Open `/models`, then a model detail route.
13. Open `/playground` and run a non-streaming request.
14. Open `/profile`, send an email verification code, and bind a disposable
    test email.
15. If signed in as an admin user, click the top-right Admin button and confirm
    it opens the original default admin UI at `/channels` on the target backend.
16. Sign out and confirm protected routes redirect to `/login`.

## Commercial Admin Rewrite Smoke Test

Use `docs/admin-mvp-smoke-test.md` only when intentionally testing the
commercial clean-room admin rewrite under `/admin`.

- Normal users should be redirected away from `/admin`.
- Admin users should reach users, channels, models, logs, redemptions, and
  billing.
- Root users should reach settings.
- Non-root admins should see the settings root-access notice.
- Run destructive actions only against disposable test data.

## Module Visibility

The app shell reads `/api/status` before entering the authenticated shell.

- Playground is currently a stable user-console navigation item.
- Additional module visibility should be wired only from backend status or user
  permission contracts when product requirements explicitly ask for it.

## Known Deferred Items

- Creem checkout.
- Waffo Pancake checkout.
- 2FA login completion UI.
- OAuth login buttons.
- Registration and password reset pages.
- Streaming Playground responses.
- Advanced commercial-admin audit tooling, if the clean-room admin rewrite is
  productized again.
