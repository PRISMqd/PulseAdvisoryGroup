"use strict";
const {API_SECURITY_HEADERS,send}=require("../lib/http-security");

function payload(){
  return{
    status:"ok",
    version:process.env.VERCEL_GIT_COMMIT_SHA||process.env.GIT_COMMIT_SHA||"unknown",
    timestamp:new Date().toISOString()
  };
}

function sendHead(res,status,headers={}){
  res.statusCode=status;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  for(const[k,v]of Object.entries(headers))res.setHeader(k,v);
  for(const[k,v]of Object.entries(API_SECURITY_HEADERS))res.setHeader(k,v);
  res.end();
}

module.exports=function health(req,res){
  const method=String(req.method||"GET").toUpperCase();
  if(method==="GET")return send(res,200,payload());
  if(method==="HEAD")return sendHead(res,200);
  return send(res,405,{error:"Method not allowed."},{Allow:"GET, HEAD"});
};
