"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {send,cookies,rawBody}=require("../lib/http-security");

function response(){
  return{
    statusCode:0,
    headers:{},
    setHeader(name,value){this.headers[name]=value},
    end(body){this.rawBody=body}
  };
}

test("JSON API responses carry fail-closed browser security headers",()=>{
  const res=response();
  send(res,200,{ok:true},{"Cache-Control":"public, max-age=3600","Strict-Transport-Security":"max-age=0","X-Frame-Options":"SAMEORIGIN"});
  assert.equal(res.statusCode,200);
  assert.equal(res.headers["Content-Type"],"application/json; charset=utf-8");
  assert.equal(res.headers["Cache-Control"],"no-store");
  assert.equal(res.headers["Strict-Transport-Security"],"max-age=31536000; includeSubDomains");
  assert.equal(res.headers["X-Content-Type-Options"],"nosniff");
  assert.equal(res.headers["X-Frame-Options"],"DENY");
  assert.equal(res.headers["Referrer-Policy"],"no-referrer");
  assert.equal(res.headers["Cross-Origin-Resource-Policy"],"same-origin");
  assert.equal(res.headers["Permissions-Policy"],"camera=(), geolocation=(), microphone=()");
  assert.equal(res.headers["Content-Security-Policy"],"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  assert.deepEqual(JSON.parse(res.rawBody),{ok:true});
});

test("callers can still attach operational headers without weakening the security baseline",()=>{
  const res=response();
  send(res,401,{error:"denied"},{"Retry-After":"60","Set-Cookie":"example=1; HttpOnly; Secure"});
  assert.equal(res.headers["Retry-After"],"60");
  assert.equal(res.headers["Set-Cookie"],"example=1; HttpOnly; Secure");
  assert.equal(res.headers["Cache-Control"],"no-store");
  assert.equal(res.headers["Strict-Transport-Security"],"max-age=31536000; includeSubDomains");
  assert.equal(res.headers["X-Frame-Options"],"DENY");
});

test("cookie parsing skips malformed percent-encoding instead of aborting the request",()=>{
  const parsed=cookies({headers:{cookie:"good=value; broken=%E0%A4%A; token=a%3Db; ignored"}});
  assert.equal(parsed.good,"value");
  assert.equal(parsed.token,"a=b");
  assert.equal(parsed.broken,undefined);
});

test("rawBody enforces the byte limit for framework-buffered bodies",async()=>{
  await assert.rejects(()=>rawBody({body:Buffer.alloc(9)},8),/Request body is too large\./);
  assert.equal((await rawBody({body:Buffer.alloc(8)},8)).length,8);
});

test("rawBody enforces the byte limit for framework-provided strings",async()=>{
  await assert.rejects(()=>rawBody({body:"éé"},3),/Request body is too large\./);
  assert.equal((await rawBody({body:"éé"},4)).length,4);
});

test("rawBody rejects invalid byte-limit configuration",async()=>{
  await assert.rejects(()=>rawBody({body:"x"},-1),/Request body limit is invalid\./);
});
