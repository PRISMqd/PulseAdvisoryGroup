"use strict";
const ENTITLEMENT_TTL_SECONDS=604800,EVENT_TTL_SECONDS=2592000,ACCESS_TTL_SECONDS=1800;
function configuration(){const url=(process.env.KV_REST_API_URL||"").replace(/\/$/,""),token=process.env.KV_REST_API_TOKEN||"";return /^https:\/\//.test(url)&&token?{url,token}:null}
async function command(parts){const c=configuration();if(!c)throw new Error("Durable entitlement storage is not configured.");const r=await fetch(c.url,{method:"POST",headers:{Authorization:`Bearer ${c.token}`,"Content-Type":"application/json"},body:JSON.stringify(parts)}),d=await r.json();if(!r.ok||d.error)throw new Error("Durable entitlement storage is unavailable.");return d.result}
async function recordEntitlement(s){const v=JSON.stringify({sessionId:s.id,productId:s.metadata.product_id,amountTotal:s.amount_total,currency:String(s.currency).toLowerCase(),paymentStatus:s.payment_status,livemode:s.livemode,tokenHash:s.metadata.fulfillment_token_hash});return command(["SET",`entitlement:${s.id}`,v,"NX","EX",ENTITLEMENT_TTL_SECONDS])}
async function readEntitlement(id){const v=await command(["GET",`entitlement:${id}`]);return v?JSON.parse(v):null}
async function redeemForReport(id,tokenHash,accessHash){const script="if redis.call('EXISTS',KEYS[1])==1 then return 0 end redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[3]) redis.call('SET',KEYS[2],ARGV[2],'EX',ARGV[4]) return 1";const result=await command(["EVAL",script,"2",`claim:${id}:${tokenHash}`,`report-access:${accessHash}`,new Date().toISOString(),id,String(ENTITLEMENT_TTL_SECONDS),String(ACCESS_TTL_SECONDS)]);return Number(result)===1}
async function readReportAccess(hash){return command(["GET",`report-access:${hash}`])}
async function markEvent(id){return command(["SET",`stripe-event:${id}`,new Date().toISOString(),"NX","EX",EVENT_TTL_SECONDS])}
module.exports={configuration,command,recordEntitlement,readEntitlement,redeemForReport,readReportAccess,markEvent};
