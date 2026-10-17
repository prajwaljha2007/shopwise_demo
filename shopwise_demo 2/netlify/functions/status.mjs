export default async function handler(request) {
  if(request.method!=='GET')return Response.json({error:'Use GET.'},{status:405});
  return Response.json({
    aiConfigured: !!process.env.HF_TOKEN,
    requiresCode: !!process.env.CHAT_ACCESS_CODE,
    provider:"Hugging Face Inference Providers",
    liveRetailersConnected:false
  },{headers:{'Cache-Control':'no-store'}});
}
