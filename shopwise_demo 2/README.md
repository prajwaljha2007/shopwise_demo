# Shopwise AI — website + real AI chatbot backend

This version preserves the Shopwise UI and shopping demo and adds a **real OpenAI-powered chatbot** that can answer general questions and remember the current chat conversation. It is not a live shopping-price website yet.

## What changed

- **Live AI chat**: sends questions to the OpenAI Responses API from a server, not from the browser. You can ask general questions as well as shopping questions. Answers depend on your model and may be incorrect.
- **Conversation continuity**: includes up to 12 recent messages with each request. Chat history stays in your current browser page and is not saved in Shopwise accounts.
- **Honest connection status**: AI connected / needs setup / protected / offline. No silent fallback that pretends a scripted demo reply is a real AI answer.
- **Safer key handling**: your API key stays on the server as an environment variable. **Never add it to the HTML, GitHub, or any client code.**
- **Optional access code**: recommended if you publish the chatbot publicly, to help limit unwanted usage. This is simple shared-code protection, not production authentication or complete abuse prevention.
- All existing demo price comparisons, promos, notes and local cart are preserved.

## Deploy online using Netlify + GitHub (recommended)

**Important:** A plain HTML / drag-and-drop-only deployment does not automatically establish the AI API backend. For this project, use a Git-connected Netlify deployment so the Netlify Functions are built and published.

1. Extract this ZIP. Inside the `shopwise_demo` folder, you should see `netlify.toml`, `public/`, `netlify/functions/`, and `lib/`.
2. Create a new GitHub repository. Upload **the files and folders INSIDE `shopwise_demo` to the repository root**, not only `index.html`. You may use a private repository. Do not upload API keys or `.env` files.
3. At [Netlify](https://app.netlify.com/), choose **Add new project → Import an existing project**, then connect the GitHub repository. The included `netlify.toml` configures `public` as the publish directory and `netlify/functions` as the functions directory.
4. In your Netlify project's **Environment variables** settings, add:
   - `OPENAI_API_KEY`: your secret OpenAI API key from [OpenAI API dashboard](https://platform.openai.com/api-keys). OpenAI API charges are separate from the ChatGPT subscription.
   - `CHAT_ACCESS_CODE`: a private code you choose (recommended before sharing your public website; give it only to trusted testers).
   - `OPENAI_MODEL` (optional): defaults to `gpt-4.1-mini`.
5. **Redeploy** the site after setting variables. Open the published site. A successfully configured chatbot displays **Live AI**; if you added an access code, choose **Unlock AI** and enter your code.
6. Ask: “What is 12 × 9?” or “Explain the difference between differentiation and integration.” These are real model requests, not fixed scripted replies.

If you already have a Netlify domain/site from a previous drag-and-drop deployment, connect that site to your GitHub repository or create a new site and later move your custom domain. You don't need to buy a domain for the AI to work.

**Deploying only `public/index.html` will display the site but NOT enable real AI**. The AI requires the backend functions and a valid API key.

## Local run on Mac / Windows / Linux

Install [Node.js](https://nodejs.org/) 20 or newer. Open a terminal in the project folder.

**macOS / Linux (same terminal session):**

```bash
export OPENAI_API_KEY='YOUR_SECRET_KEY'
export CHAT_ACCESS_CODE='YOUR_PRIVATE_CODE' # optional
npm start
```

**Windows PowerShell:**

```powershell
$env:OPENAI_API_KEY='YOUR_SECRET_KEY'
$env:CHAT_ACCESS_CODE='YOUR_PRIVATE_CODE' # optional
npm start
```

Then open <http://localhost:3000>. `npm install` isn't required because this project uses Node's built-in features only.

Do not open `public/index.html` directly from your Downloads folder if you want live AI: the file URL has no connected server.

## Testing

```bash
npm test
```

`/api/status` shows whether AI is configured; it does NOT reveal the API key. `/api/chat` sends requests to the OpenAI Responses API. Node and Netlify call the same backend code from `lib/ai.cjs`.

## Limitations and next steps

- **No live retailer prices or coupons**: the prices, reviews and voucher codes on the shopping dashboard remain made-up illustrations. The AI is instructed not to present these as verified offers.
- **No live browsing**: the chatbot can answer broad questions from model knowledge but cannot independently look up today's prices, videos or store reviews. Live sources need additional integrations.
- **No connected store accounts, synchronized retailer carts, or purchases**: do not enter real store passwords or card details.
- **Public security**: the optional shared access code alone is not strong production security. For a public-scale service, add real user authentication, rate limits, fraud/abuse monitoring, spending limits, and a proper privacy notice and retention policy.
- **API billing**: OpenAI API use is billed separately from ChatGPT. Monitor usage and set billing limits/alerts in your API account where supported.
- Messages are transmitted to the OpenAI API when AI is enabled. Do not send sensitive personal information or passwords. `store:false` is set for API responses. Your notes/cart remain in browser localStorage.

Official references: [OpenAI authentication](https://platform.openai.com/docs/api-reference/introduction), [Netlify functions](https://docs.netlify.com/build/functions/get-started/), [Netlify environment variables](https://docs.netlify.com/build/functions/environment-variables/).
