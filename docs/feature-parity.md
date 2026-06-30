# Feature Parity Matrix

This matrix tracks commercial frontend feature coverage without copying AGPL
frontend implementation details.

## Status Legend

| Status             | Meaning                                                     |
| ------------------ | ----------------------------------------------------------- |
| Planned            | Required, not started                                       |
| Protocol Needed    | Backend contract must be documented first                   |
| Protocol Extracted | Backend contract is documented and ready for typed API work |
| In Design          | Independent commercial UI design in progress                |
| In Build           | Implementation in this repository                           |
| Implemented        | Built and wired in this repository                          |
| Verified           | Built and checked against backend behavior                  |
| Active             | Current selected product/runtime strategy                   |
| Deferred           | Not required for initial commercial release                 |
| Excluded           | Intentionally not part of commercial frontend               |

## User-Facing Features

| Area       | Feature                  | Status             | Protocol Section                     | Notes                                                                         |
| ---------- | ------------------------ | ------------------ | ------------------------------------ | ----------------------------------------------------------------------------- |
| Auth       | Login                    | Implemented        | Auth / Login                         | Session login wired to backend                                                |
| Auth       | Logout                   | Implemented        | Auth / Logout                        | Clears client state and returns to login                                      |
| Auth       | Current user profile     | Implemented        | Auth / Current User                  | Drives role and account display                                               |
| Overview   | Remaining balance        | Implemented        | Wallet / Balance                     | Bound to current user quota                                                   |
| Overview   | Usage summary            | Implemented        | User Console / Usage Summary         | Bound to quota, RPM, TPM                                                      |
| Overview   | Setup guide              | Implemented        | User Console                         | Commercial UI defines new flow                                                |
| Overview   | Platform brief stream    | Implemented        | User Console / Platform Status       | Bound to status flags and platform start time                                 |
| Models     | Model list               | Implemented        | Models / User Model List             | Bound to current user model list                                              |
| Models     | Model detail             | Implemented        | Models                               | Availability detail implemented; pricing contract remains conservative        |
| Models     | Analytics dashboard      | Implemented        | Logs / Usage Logs                    | Model analysis, traffic flow, and user statistics built from usage records    |
| Logs       | Usage logs               | Implemented        | Logs / Usage Logs                    | Bound to page tab 1 with filters, pagination, and modal details               |
| Logs       | Drawing logs             | Implemented        | Logs / Drawing Logs                  | Bound to page tab 2 with filters and pagination                               |
| Logs       | Task logs                | Implemented        | Logs / Task Logs                     | Bound to page tab 3 with filters and pagination                               |
| Playground | Text request runner      | Implemented        | Playground / Session Chat Completion | Non-streaming `/pg/chat/completions` runner implemented                       |
| Playground | Model parameter controls | Implemented        | Models                               | Model, system prompt, temperature, top P, and max tokens implemented          |
| API Keys   | List keys                | Implemented        | API Keys / List API Keys             | Search and pagination implemented                                             |
| API Keys   | Create key               | Implemented        | API Keys / Create API Key            | Create modal implemented                                                      |
| API Keys   | Update key               | Implemented        | API Keys / Update API Key            | Edit modal implemented                                                        |
| API Keys   | Delete or revoke key     | Implemented        | API Keys / Delete API Key            | Delete action implemented                                                     |
| Wallet     | Balance                  | Implemented        | Wallet / Balance                     | Bound to current user quota                                                   |
| Wallet     | Billing records          | Implemented        | Wallet / Billing Records             | Bound to top-up records                                                       |
| Wallet     | Redeem or top up         | Implemented        | Wallet / Redeem Or Top Up            | Redemption, EPay, Stripe, and Waffo implemented; Creem/Waffo Pancake deferred |
| Profile    | Display user info        | Implemented        | Auth / Current User                  | Bound to auth store                                                           |
| Profile    | Update profile           | Implemented        | Auth / Update Current User           | Language/password flow uses confirmed profile endpoints                       |
| Profile    | Language preference      | Implemented        | Auth / Update Current User           | Bound to `language` update                                                    |

## Admin Strategy

| Area                       | Decision                   | Status   | Notes                                                                                          |
| -------------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| Existing default admin UI  | User-console handoff       | Active   | Top-right Admin button opens `PUBLIC_LEGACY_ADMIN_URL` or the default `/channels` path         |
| Commercial admin rewrite   | Clean-room archive/MVP     | Verified | Independent admin surface exists, but is not the current user-console Admin handoff target     |
| Shared auth with admin     | Session based              | Verified | Same backend session and `New-Api-User` header                                                 |
| Admin users                | Post-MVP users phase       | Verified | User CRUD, role/status/quota ops, OAuth bindings, binding cleanup, passkey, 2FA, subscriptions |
| Admin channels             | MVP coverage               | Verified | List, search, create, edit, delete, test, balance, copy                                        |
| Admin models               | Post-MVP models phase      | Verified | Model CRUD, official sync, conflict triage, vendor CRUD, prefills, deployments                 |
| Admin logs                 | Post-MVP logs complete     | Verified | Usage, audit, drawing, task logs, filters, usage stats, admin quota and flow data              |
| Admin redemptions          | MVP coverage               | Verified | List, search, batch generate, edit, status, cleanup                                            |
| Admin billing              | Post-MVP billing complete  | Verified | Top-up ledger, manual completion, subscription plans, and root payment gateway configuration   |
| Admin settings             | Post-MVP settings complete | Verified | Root-only settings, security editors, structured console content, and performance operations   |
| High-sensitivity admin ops | Post-MVP                   | Deferred | Advanced audit tooling                                                                         |

## Commercial Release Gate

| Gate                   | Requirement                                                                                    | Status   |
| ---------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| Source provenance      | No AGPL frontend code, styles, assets, translations, route tree, or component structure copied | Verified |
| Protocol documentation | Every implemented endpoint documented in `protocol-contract.md`                                | Verified |
| Dependency review      | All third-party packages listed with license                                                   | In Build |
| Feature parity review  | Required rows in this matrix marked Implemented or Verified                                    | In Build |
| Build verification     | `typecheck`, `build`, and `lint` pass                                                          | Verified |
| Admin handoff test     | User-console Admin button opens the original default admin UI path                              | In Build |
