# PULSE test checkout and report generator

Run `npm test` with Node 18 or newer. A static preview exercises form validation, arithmetic, download, and responsive layout; Stripe creation and verification require the included Vercel functions.

## Single external configuration and deployment gate

Import this repository into Vercel, set `STRIPE_SECRET_KEY` to a Stripe test-mode key beginning `sk_test_`, set `PUBLIC_BASE_URL` to the HTTPS preview origin, and deploy this feature branch. The API rejects absent and non-test keys, so this release cannot create a live charge. Use Stripe test card `4242 4242 4242 4242`, any future expiry, CVC, and postal code. Never commit the key or use a real card.

Fulfillment unlocks only after server retrieval confirms a paid, non-live Checkout Session for product `pulse_exposure_report_v1`. Before a future live launch, separately approve product and price, terms, refund and support policy, tax treatment, privacy, webhook-backed durable entitlement, production domain, and live-mode code and configuration.

The report accepts non-identifying organization and workforce assumptions and generates downloadable HTML plus a printable artifact. It does not accept patient records and does not establish actual or unrecognized liability, reserves, claims, covenant breach, purchase-price adjustment, actuarial loss, causation, or legal conclusions. Finance or accounting review of input definitions and intended use is required before external distribution.
