"use strict";
const API_SECURITY_HEADERS={
  "Cache-Control":"no-store",
  "Content-Security-Policy":"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "Cross-Origin-Resource-Policy":"same-origin",
  "Permissions-Policy":"camera=(), geolocation=(), microphone=()",
  "Referrer-Policy":"no-referrer",
  "Strict-Transport-Security":"max-age=31536000; includeSubDomains",
  "X-Content-Type-Options":"nosniff",
  "X-Frame-Options":"DENY"
};
function send(r,s,b,h){r.statusCode=s;r.setHeader("Content-Type","application/json; charset=utf-8");for(const[k,v]of Object.entries(h||{}))r.setHeader(k,v);for(const[k,v]of Object.entries(API_SECURITY_HEADERS))r.setHeader(k,v);r.end(JSON.stringify(b))}
function header(r,n){const h=r.headers||{},key=Object.keys(h).find(k=>k.toLowerCase()===String(n).toLowerCase());return key?String(h[key]||""):""}
function originOf(v){try{return new URL(String(v)).origin}catch{return null}}
function sameOriginRequest(r,base){const expected=originOf(base);if(!expected)return false;const site=header(r,"sec-fetch-site").trim().toLowerCase();if(site&&site!=="same-origin")return false;const origin=header(r,"origin").trim();if(origin)return origin!=="null"&&originOf(origin)===expected;const referer=header(r,"referer").trim();return!!referer&&originOf(referer)===expected}
function requireSameOrigin(r,s,base){if(sameOriginRequest(r,base))return true;send(s,403,{error:"Cross-site request denied."});return false}
function cookies(r){return Object.fromEntries(String(r.headers&&r.headers.cookie||"").split(";").map(p=>p.trim().split("=")).filter(p=>p.length===2).map(([k,v])=>[k,decodeURIComponent(v)]))}
function fulfillmentCookie(v){return`pulse_fulfillment=${encodeURIComponent(v)}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=86400`}
function clearFulfillmentCookie(){return"pulse_fulfillment=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0"}
function reportAccessCookie(v){return`pulse_report_access=${encodeURIComponent(v)}; HttpOnly; Secure; SameSite=Strict; Path=/api/generate-report; Max-Age=1800`}
async function rawBody(r,limit=1048576){if(Buffer.isBuffer(r.body))return r.body;if(typeof r.body==="string")return Buffer.from(r.body);const chunks=[];let size=0;for await(const chunk of r){const v=Buffer.from(chunk);size+=v.length;if(size>limit)throw new Error("Request body is too large.");chunks.push(v)}return Buffer.concat(chunks)}
module.exports={send,sameOriginRequest,requireSameOrigin,cookies,fulfillmentCookie,clearFulfillmentCookie,reportAccessCookie,rawBody};
