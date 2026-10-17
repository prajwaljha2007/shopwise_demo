export default async function handler(request) {
  if(request.method!=='GET')return Response.json({error:'Use GET.'},{status:405});
  return Response.json({
    aiConfigured: !!process.env.OPENAI_API_KEY,
    requiresCode: !!process.env.CHAT_ACCESS_CODE,
    liveRetailersConnected:false
  },{headers:{'Cache-Control':'no-store'}});
}
