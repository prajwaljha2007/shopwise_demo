'use strict';

// Shared backend for local Node and Netlify Functions. This file is never published as a webpage.
const { timingSafeEqual } = require('node:crypto');

class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function verifyAccess(secret, provided) {
  if (!secret) return true;
  if (typeof provided !== 'string') return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a,b);
}

function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AppError(400,'Invalid message format.');
  const message = input.message;
  if (typeof message !== 'string' || message.trim().length < 1 || message.length > 2000) {
    throw new AppError(400,'Message must be between 1 and 2,000 characters.');
  }
  const history = Array.isArray(input.history) ? input.history.slice(-12).filter(item =>
    item && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string'
  ).map(item => ({role:item.role, content:item.text.slice(0,1200)})) : [];
  // The shopping context comes from a demonstration catalog, never an external source.
  const ctx = input.context && typeof input.context === 'object' && !Array.isArray(input.context) ? input.context : {};
  const selectedProduct = typeof ctx.selectedProduct === 'string' ? ctx.selectedProduct.slice(0,100) : '';
  const offers = Array.isArray(ctx.offers) ? ctx.offers.slice(0,6).map(o=>({
    store: String(o.store||'').slice(0,60),
    estimatedTotal: Number(o.estimatedTotal)||0,
    itemPrice: Number(o.itemPrice)||0,
    shipping: Number(o.shipping)||0,
    samplePromo: String(o.samplePromo||'').slice(0,60)
  })) : [];
  const context = JSON.stringify({selectedProduct, offers, sampleData:true});
  return {message:message.trim(),history,context};
}

const INSTRUCTIONS = `You are Shopwise, a capable, clear, friendly AI assistant embedded in a shopping comparison prototype. You can answer open-ended general questions (including math, writing, studying, everyday topics) as well as shopping questions. Answer the actual user's question rather than forcing every response into a shopping recommendation. Use conversation context for follow-ups. When asked about in-app items, use the supplied demo context accurately.

CRITICAL TRANSPARENCY: The Shopwise product prices, fees, coupons, ratings, and review text are FICTIONAL SAMPLE DATA. Label them as hypothetical if mentioning them; do not describe them as live, current, real offers or valid promotions. You have NO live browsing, price feed, YouTube/Facebook review access, retailer login, real checkout or payment abilities. Never invent current prices, store coupon eligibility, stock, shipping availability, store account access or online review findings. When a question needs live information, say you cannot check it currently. You cannot modify the local cart directly; the in-app cart controls can do that. Never request or process passwords or bank/payment details. If the question isn't about shopping, don't needlessly repeat shopping disclaimers.

Respond naturally with practical details as needed. Avoid unnecessary padding. If uncertain, say so. Keep the experience suitable for a broad audience. Do not help users find, purchase, or access age-restricted, dangerous, or illicit products, weapons, intoxicants or gambling services.`;

async function generateReply(input, env=process.env, fetcher=fetch) {
  const key = env.OPENAI_API_KEY;
  if (!key) throw new AppError(503,'AI is not connected yet. The site owner must set OPENAI_API_KEY on the server.');
  const {message,history,context} = validateInput(input);
  const model = env.OPENAI_MODEL || 'gpt-4.1-mini';
  const apiInput = [
    {role:'user', content:`App catalog context (FICTIONAL, use only if shopping-related): ${context}`},
    ...history,
    {role:'user',content:message}
  ];
  let result;
  try {
    result = await fetcher('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,instructions:INSTRUCTIONS,input:apiInput,store:false,max_output_tokens:900}),
      signal:AbortSignal.timeout(27000)
    });
  } catch (err) {
    throw new AppError(502, err && err.name === 'TimeoutError' ? 'AI took too long. Please try again.' : 'Could not reach the AI service. Please try again.');
  }
  if (!result.ok) {
    if (result.status === 429) throw new AppError(429,'The AI service is busy or your API usage limit has been reached. Try again later.');
    if (result.status === 401 || result.status === 403) throw new AppError(502,'The site owner needs to check the AI API key and account settings.');
    throw new AppError(502,'The AI service returned an error. Please try again shortly.');
  }
  let body;
  try { body = await result.json(); } catch (_) { throw new AppError(502,'The AI service returned an unreadable response.'); }
  const reply = Array.isArray(body.output) ? body.output.flatMap(x=>Array.isArray(x.content)?x.content:[])
    .filter(x=>x.type==='output_text' && typeof x.text==='string').map(x=>x.text).join('\n').trim() : '';
  if (!reply) throw new AppError(502,'The AI could not complete that answer. Please try again.');
  return reply;
}

module.exports = {AppError,verifyAccess,validateInput,generateReply};
