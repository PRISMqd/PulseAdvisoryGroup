# PulseAdvisoryGroup and the PRISMqd IRI / Unified Obscured Risk Report architecture

Date: 2026-09-16

## Why this file exists

This repo was checked as part of building out the PRISMqd Institutional
Risk Intelligence (IRI) architecture — the governed pipeline
`Inputs -> CRF -> CMDS -> COVE/F -> MAM + PHC -> ACTION -> MONITOR/VERIFY`
and the "Unified Obscured Risk Report" (UORR) product that runs it. This
note records what was found here so a future session doesn't re-run the
same reconnaissance.

## What this repo actually is

`PulseAdvisoryGroup` is PULSE: a narrow, self-contained static
marketing + Stripe-checkout site (vanilla HTML/CSS/JS + Vercel serverless
functions in `api/`) that sells a single paid "Workforce Exposure Advisory
Report" — a workforce-turnover-cost lead-generation product. It has:

- no Supabase project or database of any kind (entitlement/session state
  lives in Vercel KV/Upstash via `lib/durable-store.js`);
- no authentication or multi-tenant model beyond a Stripe-session-gated,
  cookie-scoped single-report redemption;
- no CRF, CMDS, COVE/F, or MAM logic anywhere — `api/_server-report.js`
  contains only a hardcoded PHC-like formula
  (`modeledPatientCareDays * 0.029 * 24826`) and a `mamoduleStatus` field
  that is always the literal string `"DATA NOT SUFFICIENT"`;
- no facility entity model, evidence-classification schema, or
  multi-stakeholder view switching.

This matches its intended role in the canonical PRISMqd architecture:
per the PRISMqd Canonical Build Spec, PULSE is "Services and
implementation channel. May consume controlled PRISMqd outputs but may
not redefine the ontology or compete with the PRISMqd system brand." It
is not, and should not become, the IRI/UORR substrate.

## Where the actual UORR/IRI work lives

The governed CRF/CMDS/COVE-F/MAM/PHC pipeline, its Supabase schema, its
orchestrator, and its client UI live in
`PRISMqd/PRISM-Intelligence-Command-Center-`, primarily on branch
`claude/prismqd-iri-architecture-wmz6gb` (built on top of
`claude/prism-command-center-integration-6qcthh`, the branch that first
implemented the "Unified Obscured Risk Report" per the 2026-09-16
"Claude Code Delta Implementation Handoff v1.0"). See that repo's
`docs/unified-obscured-risk-report.md` for the architecture, module
contracts, and report schema.

## What was in flight here at the time of this check

Branch `factory/production-readiness-20260916` was mid-flight on CSRF /
same-origin request hardening and a CI release-readiness gate for the
existing Stripe checkout flow (`lib/http-security.js`,
`.github/workflows/production-readiness.yml`). That work is orthogonal
to the IRI/UORR initiative and was not touched by it.

## If PULSE is later asked to surface UORR output

If a future decision brings a PULSE-branded surface for UORR reports
(e.g., a sales/marketing front door onto the governed report), the
correct approach per the architecture is for PULSE to consume the
Command Center's report object/API as a client, not to reimplement or
fork any of CRF/CMDS/COVE-F/MAM/PHC here. That decision has not been
made as of this note.
