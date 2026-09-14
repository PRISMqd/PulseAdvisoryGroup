"use strict";
function send(r,s,b,h){r.statusCode=s;r.setHeader("Content-Type","application/json; charset=utf-8");r.setHeader("Cache-Control","no-store");for(const[k,v]of Object.entries(h||{}))r.setHeader(k,v);r.end(JSON.stringify(b))}
function cookies(r){return Object.fromEntries(String(r.headers&&r.headers.cookie||"").split(";").map(p=>p.trim().split("=")).filter(p=>p.length===2).map(([k,v])=>[k,decodeURIComponent(v)]))}
function fulfillmentCookie(v){return`pulse_fulfillment=${encodeURIComponent(v)}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=86400`}
function clearFulfillmentCookie(){return"pulse_fulfillment=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0"}
async function rawBody(r,limit=1048576){if(Buffer.isBuffer(r.body))return r.body;if(typeof r.body==="string")return Buffer.from(r.body);const chunks=[];let size=0;for await(const chunk of r){const v=Buffer.from(chunk);size+=v.length;if(size>limit)throw new Error("Request body is too large.");chunks.push(v)}return Buffer.concat(chunks)}
module.exports={send,cookies,fulfillmentCookie,clearFulfillmentCookie,rawBody};
