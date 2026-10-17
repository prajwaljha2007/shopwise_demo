# Shopwise — free-credit AI chatbot (Hugging Face)

**This version keeps the original Shopwise design and demo shopping catalog.** It replaces the paid OpenAI API connection with Hugging Face Inference Providers. It also keeps the existing local shopping cart, saved notes, and sample promotion codes.

## What "free" means

Hugging Face currently gives personal free accounts **US$0.10 of Inference Providers credits per month (subject to change)**. This is enough to experiment, but **it is not unlimited use**. If you run out of credits or hit a service limit, the chatbot shows a useful error; this project does not make payments or enable extra usage. Check the official pricing page: https://huggingface.co/docs/inference-providers/pricing

Hugging Face's general account terms permit account registration from age **13**, subject to local law and the relevant provider terms: https://huggingface.co/terms-of-service

## Step 1 — Create a Hugging Face token

1. Sign up or log in at https://huggingface.co/join (follow the service's age and account rules).
2. Open https://huggingface.co/settings/tokens .
3. Choose **Create new token**, then **Fine-grained**.
4. Give it an easy-to-recognize name, such as `shopwise-chat`.
5. Grant **Make calls to Inference Providers** (or the equivalent permission shown by Hugging Face). Avoid granting repository write access.
6. Create the token and copy it once to a private place. **Never paste a token into a GitHub source file, screenshot, ChatGPT message, or browser console.**

## Step 2 — Replace the old code in your EXISTING GitHub project

Based on your screenshot, your repository is `shopwise_demo` and your files are in a folder named **`shopwise_demo 2`** (note the space).

The ZIP provided with this guide contains a folder named `shopwise_demo 2`, with `public/`, `netlify/functions/`, `lib/`, `test/`, `netlify.toml`, and more. Your existing shopwise design file is `public/index.html`.

**Option A (recommended):** In your extracted project folder on your Mac, replace your old `shopwise_demo 2` files with those in the ZIP. In your GitHub repository, navigate **inside** the existing `shopwise_demo 2` directory, select **Add file → Upload files**, then upload the **CONTENTS** of the new `shopwise_demo 2` folder. Commit the changes. Keep the same paths so Netlify can find `public/index.html` and the functions. If GitHub declines to overwrite via upload, edit/replace the files using a Git client, GitHub Desktop, or VS Code instead. Do **not** upload the ZIP file itself into the repo.

**Option B:** If you make a new repo instead, copy the files *inside* `shopwise_demo 2` directly to its root and leave Netlify's Base directory empty.

For your current Netlify site (connected to a repo with `shopwise_demo 2` at its root), the intended build settings are:

| Netlify field | Value |
|---|---|
| Base directory | `shopwise_demo 2` |
| Publish directory | `public` |
| Functions directory | `netlify/functions` |
| Build command | leave empty |

`netlify.toml` also declares the publish and functions directories relative to the base directory.

## Step 3 — Set token privately in Netlify

1. Go to your existing Netlify project **shopwiseduogpt → Project configuration → Environment variables**.
2. Add a **new** variable:
   - **Key**: `HF_TOKEN`
   - **Value**: the secret `hf_...` token you copied from Hugging Face
   - Check **Contains secret values** if available.
   - Make sure it is available to **Functions**.
3. Optional model override variable: `HF_MODEL` → `Qwen/Qwen3-4B-Instruct-2507:cheapest` (the backend already uses this default; usually don't add this variable).
4. Strongly recommended for public demos: Set `CHAT_ACCESS_CODE` to a long private code of your choice. In the Shopwise UI, click **Unlock AI** to enter it. **This is basic access control, not production-grade authentication.**
5. You can delete the old `OPENAI_API_KEY` from Netlify; the new project **does not use it**.
6. Go to **Deploys**, and redeploy the latest GitHub commit (or push a new commit that triggers a deploy). Wait for **Published**.

Your Hugging Face token must *only* appear in Netlify environment variables, never in your repo or webpage source.

## Step 4 — Verify

Open the Netlify website and ask **"What is 7 × 8?"**. A real AI reply depends on Hugging Face accepting your account, token, selected model, and free-credit balance.

If there is an error:

| Message | Meaning |
|---|---|
| `Free AI is not configured` | `HF_TOKEN` is absent or not accessible to Functions; redeploy. |
| `token was rejected` | Bad token or wrong token settings; create a new fine-grained token. |
| `credits may be exhausted` | Monthly free credit spent or permissions unavailable; check Hugging Face usage. |
| `Free AI usage limit reached` | Too many requests; wait or check quota. |
| `This AI model is not available` | Try a supported model by setting `HF_MODEL`, or return to the default. |

Free credits vary and this project is **not tested against a real provider account** because no private token was supplied. It passed automated tests with mock provider responses and can run locally.

## Local testing

Install Node.js 20 or newer. From the project folder:

```bash
export HF_TOKEN='your_own_secret_token'
export CHAT_ACCESS_CODE='a_private_code'  # recommended
npm start
```

Then visit http://localhost:3000 . Run `npm test` for backend tests. Node fetch is built in; no package install is needed.

## Scope and security

- General open-ended chat works **within model capabilities**; answers can be incorrect.
- Live prices, online comments, discounts, reviews and retail accounts are **not** connected, and the displayed shopping information remains **fictional**.
- Requests are transmitted to Hugging Face and possibly to the routing inference provider. **Don't enter passwords, real payment details, or other confidential information.** Check Hugging Face privacy disclosures for data handling.
- Your site is public unless you protect it. Add `CHAT_ACCESS_CODE` and do not share your token. For a widely used product, add proper authentication, hosted rate-limiting, abuse controls, privacy policies, and monitoring before launch.

Official docs: https://huggingface.co/docs/inference-providers/index , https://huggingface.co/docs/inference-providers/pricing , https://docs.netlify.com/build/functions/overview/ .
