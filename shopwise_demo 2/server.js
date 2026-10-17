// Local development server for Shopwise. For Netlify use netlify/functions/ instead.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {AppError,verifyAccess,generateReply} = require('./lib/ai.cjs');
const PORT = Number(process.env.PORT || 3000);
const FILE = path.join(__dirname,'public','index.html');
const recent = new Map();

function send(res,status,value,type='application/json; charset=utf-8') {
  res.writeHead(status,{
    'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY'
  });
  res.end(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value));
}
function readJSON(req) {
  return new Promise((resolve,reject)=>{
    let buf='';
    req.on('data',chunk=>{buf+=chunk;if(buf.length>22000){reject(new AppError(413,'Request is too large.'));req.destroy();}});
    req.on('end',()=>{try{resolve(JSON.parse(buf))}catch(_){reject(new AppError(400,'Invalid JSON.'))}});
    req.on('error',reject);
  });
}
async function handler(req,res) {
  const route = new URL(req.url,'http://localhost').pathname;
  if(req.method==='GET' && (route==='/'||route==='/index.html')) {
    try {send(res,200,await fs.promises.readFile(FILE),'text/html; charset=utf-8');}
    catch(_){send(res,500,{error:'Cannot load site.'})}
    return;
  }
  if(req.method==='GET' && route==='/api/status') {
    return send(res,200,{aiConfigured:!!process.env.HF_TOKEN,requiresCode:!!process.env.CHAT_ACCESS_CODE,liveRetailersConnected:false});
  }
  if(req.method==='POST' && route==='/api/chat') {
    if(!verifyAccess(process.env.CHAT_ACCESS_CODE,req.headers['x-shopwise-code'])) return send(res,401,{error:'Enter the Shopwise chat access code to continue.'});
    // Lightweight local guard. For production, also add hosting-level rate limits and abuse protection.
    const ip=req.socket.remoteAddress||'unknown',now=Date.now(),previous=recent.get(ip)||[];
    const attempts=previous.filter(x=>now-x<60000);
    if(attempts.length>=15)return send(res,429,{error:'Too many requests. Please wait a minute.'});
    attempts.push(now);recent.set(ip,attempts);
    try { return send(res,200,{reply:await generateReply(await readJSON(req))}); }
    catch(err){return send(res,err.status||500,{error:err instanceof AppError?err.message:'Unexpected server error.'});}
  }
  return send(res,404,{error:'Not found.'});
}
http.createServer((req,res)=>handler(req,res).catch(()=>send(res,500,{error:'Unexpected server error.'})))
  .listen(PORT,'0.0.0.0',()=>console.log(`Shopwise: http://localhost:${PORT} | AI ${process.env.HF_TOKEN?'configured':'requires HF_TOKEN'}`));
