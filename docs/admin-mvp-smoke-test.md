# Admin MVP Smoke Test

Use this checklist after connecting the commercial frontend to a compatible backend.

## Session And Routing

- Sign in as a normal user and confirm `/admin` redirects to `/overview`.
- Sign in as an admin user and confirm `/admin`, `/admin/users`, `/admin/channels`, `/admin/models`, `/admin/logs`, `/admin/redemptions`, and `/admin/billing` open.
- Sign in as a root user and confirm `/admin/settings` loads option data.
- Sign in as a non-root admin and confirm `/admin/settings` shows the root-access notice.
- Use the Admin shell `User console` link and confirm it returns to `/overview`.

## Users

- Search by username.
- Create a test user.
- Edit display name, group, status, and role.
- Add quota, subtract quota, and override quota.
- Delete only disposable test users.

## Channels

- Search by channel name and model.
- Create a single test channel.
- Edit models, group, tag, priority, and weight.
- Run test channel and balance update actions.
- Disable, enable, copy, and delete the disposable channel.

## Models

- Search model metadata.
- Filter by vendor when vendor data exists.
- Create, edit, disable, enable, and delete a disposable model.
- Open missing-model review and confirm it does not write until explicitly created.

## Logs

- Switch between usage logs, drawing logs, and task logs.
- Apply filters and pagination.
- Confirm usage quota, RPM, and TPM statistics load without using the deprecated `/api/log/search` endpoint.

## Redemptions

- Generate one code and multiple codes.
- Edit quota and expiration.
- Disable and enable an unused code.
- Confirm used codes cannot be re-enabled from the UI.
- Clean invalid codes only on a disposable test database.

## Billing

- Search top-up records.
- Complete a disposable pending top-up by row action.
- Complete a disposable pending top-up by trade number.
- Confirm completed records cannot be completed again from the row action.

## Settings

- Update one low-risk text option such as `SystemName`, then reload.
- Toggle one low-risk boolean option, then toggle it back.
- Paste invalid JSON in an overview content field and confirm the UI blocks saving.
- Paste backend-valid JSON and confirm the backend accepts it.

## Production Readiness Notes

- Payment gateway configuration remains Post-MVP.
- Sensitive security configuration remains Post-MVP.
- Structured editors for overview JSON content remain Post-MVP.
- High-sensitivity actions should move from browser confirms to the unified sensitive confirmation dialog before production operations.
