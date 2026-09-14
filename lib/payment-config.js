"use strict";
const PRODUCT_ID="pulse_exposure_report_v1",AMOUNT_TOTAL=9900,CURRENCY="usd";
function stripeKey(){const v=process.env.STRIPE_SECRET_KEY||"";return v.startsWith("sk_test_")?v:null}
function publicBaseUrl(){const c=process.env.PUBLIC_BASE_URL||"";try{const u=new URL(c);if(u.protocol!=="https:"&&u.hostname!=="127.0.0.1"&&u.hostname!=="localhost")return null;return u.origin+u.pathname.replace(/\/$/,"")}catch{return null}}
function entitlementMatches(s){return!!(s&&s.payment_status==="paid"&&s.livemode===false&&s.metadata&&s.metadata.product_id===PRODUCT_ID&&s.amount_total===AMOUNT_TOTAL&&String(s.currency||"").toLowerCase()===CURRENCY)}
module.exports={PRODUCT_ID,AMOUNT_TOTAL,CURRENCY,stripeKey,publicBaseUrl,entitlementMatches};
