# PULSE test checkout and report generator

Run `npm run test:all` with Node 18 or newer and local Chrome, or set `CHROME_PATH` to a Chrome-compatible executable. The browser harness renders and captures the service at 390x844 and 1440x1000 under `test-artifacts/`.

## Preview configuration gate

Import this feature branch into Vercel and configure these encrypted environment variables:

- `STRIPE_SECRET_KEY`: Stripe test secret beginning `sk_test_`.
- `STRIPE_WEBHOOK_SECRET`: signing secret beginning `whsec_` for `https://<preview-origin>/api/stripe-webhook`.
- `PUBLIC_BASE_URL`: exact approved HTTPS preview origin.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`: a Vercel KV/Upstash-compatible REST store. The token requires only command access to the isolated preview database.

Configure Stripe test-mode events `checkout.session.completed` and `checkout.session.async_payment_succeeded` for the webhook URL. Never commit secrets, use a live key, or use a real card. For destination QA, use Stripe's test card `4242 4242 4242 4242`, any future expiry, CVC, and postal code.

Checkout fixes the product, USD 99.00 amount, and currency on the server. The server issues an HttpOnly, Secure, SameSite=Lax browser cookie whose one-way hash is attached to the Checkout Session. The webhook verifies Stripe's signature within a five-minute tolerance and writes an idempotent entitlement to durable storage. Fulfillment retrieves Stripe, re-verifies paid/non-live/product/amount/currency, matches the browser token to the durable entitlement, and atomically exchanges it once for a short-lived HttpOnly report-access cookie. A shared or replayed `session_id` does not unlock access. The public page exposes only a non-exporting arithmetic demo; full HTML report construction occurs only in `POST /api/generate-report` after durable server validation of the redeemed access cookie.

The report accepts non-identifying organization and workforce assumptions and generates downloadable HTML plus a printable artifact. It does not accept patient records and does not establish actual or unrecognized liability, reserves, claims, covenant breach, purchase-price adjustment, actuarial loss, causation, or legal conclusions.

## Unified workforce-exposure profile

The customer enters one profile. Existing workforce arithmetic is unchanged. `modeledPatientCareDays = vacancyFteDays * patientsPerVacancyDay`, where patients per vacancy day is bounded 0-10 and defaults to 0.5. The institution must supply a denominator-matched patient-volume basis.

The PHC reported-rate sensitivity is `modeledPatientCareDays * 0.029 * 24826`. It is presented separately and is never added to `combinedScenario` or `scenarioDifference`. It is non-transport-validated sensitivity analysis, not observed harm, booked liability, a reserve, a claim forecast, or a decision-ready estimate.

MAModule always returns `DATA NOT SUFFICIENT` and no numeric mortality output. Institution-specific denominator-matched staffing, exposure, and outcome data plus a validated causal and transport model are prerequisites for estimation.

## Analytical report version 2

The landing page publishes no price for human consulting or advisory work; those services are scoped only after matter-fit review. The USD 99 amount on `service.html` remains explicitly a Stripe test-mode automated-report price.

The single report profile now records decision context, data scope, workforce-denominator basis, a bounded decision question, and bounded source-provenance notes. The free surface provides an executive arithmetic and driver preview but contains no report renderer or exporter. After the existing server-verified paid-entitlement flow, the server generates the full report with an executive brief, readiness rating, provenance table, workforce decomposition, exact one-driver-at-a-time sensitivities, conditional reported-amount comparison, governed PHC and MAModule sections, conclusion-evidence matrix, context-specific implications, a bounded stakeholder exposure map, prioritized next data, methodology, audit trail, and limitations.

The stakeholder exposure map quantifies only the institution's replacement/direct workforce scenario from entered assumptions. Workforce, patients, payers, and public systems are identified as potentially affected but not quantified or attributed. Government and tax consequences are not assessed. Provenance and integrity controls support traceability but do not establish causation.

Readiness records observable gates only: the declared denominator basis, whether a provenance note was supplied, and `Independent verification: Pending`. Note length, repetition, detail, or apparent semantic quality cannot improve readiness. A declared denominator-matched FTE basis plus any supplied note is capped at `Developing — unverified`; proxy and other bases remain `Limited`. The executive `What matters now` section interprets exact 1-percentage-point turnover, $10,000 per-departure, and 10-vacancy-day sensitivities while explicitly limiting them to model-sensitive inputs.

The report structure is informed by the IFRS Conceptual Framework qualitative characteristics and GAO-09-3SP guidance on traceable assumptions and sensitivity analysis. This is an alignment aid only; the report does not claim IFRS, GAAP, GAO, audit, assurance, actuarial, legal, or regulatory compliance.

`sample-reports/cleveland-clinic-illustrative.html` mirrors the full report for the credit/lending context. It remains prominently labeled `NON-INSTITUTIONAL ILLUSTRATION / NOT FOR DECISION USE`, identifies enterprise RN headcount as an FTE proxy, distinguishes public inputs from demonstration assumptions, and suppresses a reported-amount comparison because none was supplied.

No preview or transaction has been run from this package because source-upload authorization and test credentials remain external gates. Before a future live launch, separately approve product and price, terms, refund/support policy, tax treatment, privacy, the production domain, and live-mode code/configuration.
