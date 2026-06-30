# Deployment

This commercial frontend can be deployed either on the same origin as the
backend or as a separate origin.

## Environment

| Variable                  | Required | Description                                                                 |
| ------------------------- | -------- | --------------------------------------------------------------------------- |
| `PUBLIC_API_BASE_URL`     | No       | Backend origin. Leave empty for same-origin deployment or local dev proxy.  |
| `PUBLIC_LEGACY_ADMIN_URL` | No       | Explicit original default-theme admin UI URL. Overrides automatic fallback. |
| `DEV_BACKEND_ORIGIN`      | No       | Dev-only backend origin used by Rsbuild proxy.                              |

The user-console Admin button is a handoff to the original default-theme admin
UI. Its default admin path is `/channels`, matching the original `web/default`
admin channel route.

Examples:

```env
# Local dev with Rsbuild proxy
PUBLIC_API_BASE_URL=
DEV_BACKEND_ORIGIN=http://localhost:3000
PUBLIC_LEGACY_ADMIN_URL=http://localhost:3000/channels

# Separate backend origin
PUBLIC_API_BASE_URL=https://api.example.com
PUBLIC_LEGACY_ADMIN_URL=

# Same-origin deployment
PUBLIC_API_BASE_URL=
PUBLIC_LEGACY_ADMIN_URL=/channels
```

With `PUBLIC_API_BASE_URL=https://api.example.com` and
`PUBLIC_LEGACY_ADMIN_URL=` empty, the user-console Admin button opens
`https://api.example.com/channels`.

## Local Dev Proxy

For local backend integration, prefer the dev proxy to avoid browser CORS and
cross-site cookie issues.

```env
PUBLIC_API_BASE_URL=
DEV_BACKEND_ORIGIN=http://localhost:3000
PUBLIC_LEGACY_ADMIN_URL=http://localhost:3000/channels
```

With this setup, the browser calls same-origin API paths such as
`/api/user/login`, and Rsbuild proxies them to the backend. The Admin button
opens the original backend UI directly through `PUBLIC_LEGACY_ADMIN_URL`.

Restart `bun run dev` after changing any `.env` value. Public environment
values are embedded into the frontend bundle.

## Same-Origin Deployment

Recommended when possible.

- Frontend serves from the same origin as backend.
- Session cookies work without special cross-site browser handling.
- `PUBLIC_API_BASE_URL` can remain empty.
- Set `PUBLIC_LEGACY_ADMIN_URL=/channels`, or leave it empty if the same-origin
  fallback should resolve to `/channels`.

## Cross-Origin Deployment

When frontend and backend are on different origins:

- Backend must allow the frontend origin in CORS.
- Backend cookies must be configured for cross-site usage when session auth is
  needed.
- HTTPS is required for secure cross-site cookies.
- The frontend uses `credentials: include` for dashboard requests.
- The Admin button opens `PUBLIC_LEGACY_ADMIN_URL` when set; otherwise it opens
  `/channels` on the `PUBLIC_API_BASE_URL` origin.
- Do not set production `PUBLIC_LEGACY_ADMIN_URL` to a `localhost` URL because
  public environment values are baked into the production assets.

## Build

```bash
bun install
bun run verify
```

The production output is written to `dist/`.

## Release Gate

Before deploying:

- `bun run provenance`
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Review `docs/provenance-checklist.md`.
- Update `docs/third-party-notices.md` if dependencies changed.
