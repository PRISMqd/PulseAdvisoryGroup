"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const health=require("../api/health");

function response(){
  return{
    statusCode:0,
    headers:{},
    setHeader(name,value){this.headers[name]=value},
    end(body){this.rawBody=body}
  };
}

test("health GET is dynamic, source-identifiable, and no-store",()=>{
  const previous=process.env.VERCEL_GIT_COMMIT_SHA;
  process.env.VERCEL_GIT_COMMIT_SHA="0123456789abcdef0123456789abcdef01234567";
  const res=response();
  health({method:"GET"},res);
  if(previous===undefined)delete process.env.VERCEL_GIT_COMMIT_SHA;else process.env.VERCEL_GIT_COMMIT_SHA=previous;
  assert.equal(res.statusCode,200);
  const body=JSON.parse(res.rawBody);
  assert.equal(body.status,"ok");
  assert.equal(body.version,"0123456789abcdef0123456789abcdef01234567");
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
  assert.equal(res.headers["Cache-Control"],"no-store");
  assert.equal(res.headers["Referrer-Policy"],"no-referrer");
  assert.equal(res.headers["X-Content-Type-Options"],"nosniff");
});

test("health HEAD has the GET security contract without a body",()=>{
  const res=response();
  health({method:"HEAD"},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.rawBody,undefined);
  assert.equal(res.headers["Cache-Control"],"no-store");
  assert.equal(res.headers["Content-Type"],"application/json; charset=utf-8");
});

test("health rejects unsupported methods with explicit Allow",()=>{
  const res=response();
  health({method:"POST"},res);
  assert.equal(res.statusCode,405);
  assert.equal(res.headers.Allow,"GET, HEAD");
  assert.equal(JSON.parse(res.rawBody).error,"Method not allowed.");
  assert.equal(res.headers["Cache-Control"],"no-store");
});
