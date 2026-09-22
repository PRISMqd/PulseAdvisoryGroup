# PULSE Advisory Group PR-1 Release Readiness and Recovery Control

Status: **NOT PRODUCTION READY**

Candidate branch: `factory/production-readiness-20260916`
Base branch: `main`

This document is the durable release-control policy for PR #1. Exact mutable candidate SHA, CI run identifiers, deployment identifiers, and artifact hashes belong in PR metadata or the canonical portfolio register so updating evidence does not itself invalidate the tested candidate.

This record does not authorize production merge, public promotion, paid infrastructure, live payment credentials, production payment processing, live customer data, or destructive storage operations.

## Current release boundary

The candidate contains a server-backed revenue/report path that depends on an API-capable runtime. Static GitHub Pages is not a valid functional production destination for the API path and must not be treated as evidence that checkout, webhook, entitlement, report-generation, or runtime-health behavior is operational.

The candidate is intentionally restricted to Stripe test-mode sessions. Production promotion requires a separately authorized runtime with correctly scoped server-only secrets and durable entitlement storage.

`/api/health` is the release-observability identity surface. It must remain non-mutating, expose only `status`, source/deployment `version`, and a runtime timestamp, inherit the shared no-store/security-header baseline, support GET and bodyless HEAD, and reject unsupported methods with `405` plus `Allow: GET, HEAD`. A source-level test is not destination proof: the hosted response must be checked against the exact candidate deployment before any readiness claim.

## Pre-promotion checklist

Before any production authorization is requested, all of the following must be green on the exact candidate SHA:

- [x] Locked dependency install and production dependency/security audit.
- [ ] Syntax/type/static validation applicable to the repository.
- [ ] Deterministic service tests for checkout, status/redemption, webhook, report generation, health, and security boundary behavior.
- [ ] Exact hosted `/api/health` GET returns `200`, `status=ok`, the expected source/deployment version, a parseable runtime timestamp, and the shared no-store/security-header baseline.
- [ ] Two successive hosted health GETs demonstrate a changing runtime timestamp rather than stale/prerendered content.
- [ ] Hosted `/api/health` HEAD returns `200` without a response body; unsupported POST returns `405` with `Allow: GET, HEAD`.
- [ ] Same-origin success path validated on an already-authorized API-capable protected non-production destination.
- [ ] Cross-site and missing-provenance browser requests rejected before external work.
- [ ] Stripe test-mode checkout verified; production/livemode credentials and sessions rejected.
- [ ] Webhook signature validation and event replay/idempotency behavior verified.
- [ ] Durable entitlement store configured with non-production credentials; secrets are server-only and absent from client output/logs.
- [ ] One-time fulfillment redemption and replay rejection verified.
- [ ] Report-access token expiry and replay behavior verified.
- [ ] Expected response security headers and no-store behavior verified on sensitive API responses.
- [ ] Runtime logs contain enough request/error correlation for diagnosis without exposing tokens, cookies, payment credentials, entitlement secrets, or report-access values.
- [ ] Hosted critical path, failure states, and recovery behavior tested with synthetic/test data only.
- [ ] Exact deployment identity recorded and bound to the exact tested source SHA.
- [ ] Production branch/deployment baseline captured immediately before promotion.
- [ ] Production environment-variable inventory reviewed for least privilege and test/live separation.
- [ ] Rollback path below reviewed and executable for the intended production host.

## Data and entitlement recovery boundary

The current durable store uses short-lived records for entitlement, claim, report access, and Stripe-event replay protection. Rollback must preserve those records and their TTL behavior. Application rollback must never use store clearing, key deletion, or credential invalidation as a substitute for code rollback.

Before a future production release changes key formats, TTL semantics, product identity, amount/currency binding, replay keys, or report-access semantics, that change requires a separate forward/backward migration and recovery test on an authorized non-production store.

## Rollback triggers

Rollback or immediate promotion halt is required for any of the following:

- production/livemode payment activity is accepted by a candidate intended to be test-only;
- same-origin enforcement can be bypassed for checkout, redemption, or report generation;
- webhook signature verification or replay protection fails;
- a paid entitlement can be redeemed more than once contrary to the intended one-time contract;
- report access is granted without a matching durable entitlement and one-time redemption record;
- secrets, cookies, fulfillment tokens, report-access tokens, or sensitive payment metadata appear in client assets or logs;
- deployment identity does not match the approved/tested source SHA;
- protected runtime health fails, reports the wrong version, becomes cache-stale, or violates the GET/HEAD/405 contract;
- durable storage is unavailable or behaves inconsistently with the validated release contract.

## Recovery procedure after a future explicitly authorized promotion

1. Record the production branch SHA, deployment identifier, and environment/configuration version immediately before promotion.
2. Promote only the exact tested SHA through the normal deployment path; never force-update shared production history.
3. Run post-promotion synthetic health and critical-path checks before accepting live traffic or enabling live payment credentials; the health version must match the promoted source/deployment identity and successive timestamps must change.
4. If a rollback trigger occurs, disable or keep disabled any live-payment enablement first when that can be done reversibly without deleting credentials or data.
5. Revert the promotion commit or redeploy the recorded known-good source revision through the normal deployment mechanism. Do not force-push `main`.
6. Do not delete entitlement, replay-protection, or report-access records during rollback. Preserve the durable store unless a separately tested data-recovery procedure explicitly requires otherwise.
7. Re-run health GET/HEAD/405/version/timestamp/header checks, same-origin rejection, webhook-signature, replay, entitlement, report-access, and secret-non-disclosure checks against the restored revision.
8. Record the restored deployment identity and verification evidence in the canonical portfolio/deployment register.
9. If the incident involved a secret, token, or external credential, rotate/revoke only under the credential owner's authorization and record the resulting configuration version without storing the secret value.

## Promotion decision rule

PR #1 cannot be represented as production-ready until exact-SHA CI is green and the exact candidate has passed protected API-runtime validation with synthetic/test data. If production promotion becomes the only remaining gate, the approval packet must identify the exact source SHA, exact deployment artifact, validation evidence, current production baseline, rollback path, and the minimum explicit approval required to merge/promote.

Any source change after validation requires evidence reconciliation against the new exact SHA before promotion.
