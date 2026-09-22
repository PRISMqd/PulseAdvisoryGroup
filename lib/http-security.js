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
function cookies(r){const entries=[];for(const part of String(r.headers&&r.headers.cookie||"").split(";")){const value=part.trim(),separator=value.indexOf("=");if(separator<=0)continue;const key=value.slice(0,separator),raw=value.slice(separator+1);try{entries.push([key,decodeURIComponent(raw)])}catch{}}return Object.fromEntries(entries)}
function fulfillmentCookie(v){return`pulse_fulfillment=${encodeURIComponent(v)}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=86400`}
function clearFulfillmentCookie(){return"pulse_fulfillment=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0"}
function reportAccessCookie(v){return`pulse_report_access=${encodeURIComponent(v)}; HttpOnly; Secure; SameSite=Strict; Path=/api/generate-report; Max-Age=1800`}
function bodyTooLarge(){return new Error("Request body is too large.")}
async function rawBody(r,limit=1048576){if(!Number.isSafeInteger(limit)||limit<0)throw new Error("Request body limit is invalid.");if(Buffer.isBuffer(r.body)){if(r.body.length>limit)throw bodyTooLarge();return r.body}if(typeof r.body==="string"){const body=Buffer.from(r.body);if(body.length>limit)throw bodyTooLarge();return body}const chunks=[];let size=0;for await(const chunk of r){const v=Buffer.from(chunk);size+=v.length;if(size>limit)throw bodyTooLarge();chunks.push(v)}return Buffer.concat(chunks)}
module.exports={API_SECURITY_HEADERS,send,sameOriginRequest,requireSameOrigin,cookies,fulfillmentCookie,clearFulfillmentCookie,reportAccessCookie,rawBody};
