# Reply AI

Reply suggestions for X/Twitter & Reddit — generated locally via Ollama, zero cloud calls.

## ▌About

A lightweight Chrome extension that reads the post in front of you and drafts a few ready-to-post replies, written entirely by a model running in your own Ollama instance. No API keys, no cloud inference, no telemetry.

Built for people who reply a lot and want a faster first draft without handing their feed to a third-party API. Local-first, model-agnostic, no dark patterns.

## ▌Tech Stack

```
Runtime      Chrome Extension (Manifest V3), Service Worker
Inference    Ollama — any local chat model (qwen2.5, llama3.2, mistral, gemma2, ...)
Detection    MutationObserver, DOM scraping (X/Twitter, Reddit — new & old)
UI           Vanilla JS, CSS custom properties
```

## ▌How It Works

```
content script              background worker              ollama
(reads post text)   send    (builds prompt,        POST    (your local
twitter.com / x.com ──────▶   calls Ollama)       ────────▶ model)
reddit.com           ◀──────                       ◀────────
                      suggestions                    JSON reply
```

1. A `MutationObserver` watches the feed and attaches a suggestion control to each post as it loads.
2. Clicking it sends the post's text to the background service worker.
3. The worker builds a prompt — tone, suggestion count, platform — and calls Ollama's `/api/chat`.
4. The response is parsed into individual suggestions and rendered beneath the post.

Everything happens on your machine. No remote backend.

## ▌Features

- Inline suggestions — a small control under every post on your feed
- Fully local — every request goes to `localhost:11434`, nothing sent to a third party
- Model-agnostic — works with anything pulled into Ollama, switch from the popup
- Tunable tone — witty, supportive, professional, sarcastic, politely contrarian, curious, or custom
- One-click copy into the native reply box
- Per-site toggle for X/Twitter and Reddit independently

## ▌Install

**1. Set up Ollama**

```bash
ollama pull qwen2.5:7b-instruct
```

Allow extension requests to reach Ollama:

| Platform | Steps |
|---|---|
| Windows | Environment Variables → edit for your account → add `OLLAMA_ORIGINS` = `chrome-extension://*` → restart Ollama |
| macOS | `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"` → restart Ollama |
| Linux | Add `Environment="OLLAMA_ORIGINS=chrome-extension://*"` to the `ollama.service` unit → `sudo systemctl restart ollama` |

**2. Load the extension**

`chrome://extensions` → Developer mode → Load unpacked

**3. Configure**

Open the popup → Check connection → pick a model → set tone & count → Save settings.

## ▌Usage

Browse `x.com`, `twitter.com`, `www.reddit.com`, or `old.reddit.com`. A "Suggest replies" control appears on each post — click it, then copy the suggestion you want into the native reply box.

## ▌Configuration

| Setting | Description | Default |
|---|---|---|
| Ollama URL | Local Ollama server address | `http://localhost:11434` |
| Model | Any model available via `ollama list` | `llama3.1` |
| Suggestion count | Replies per post, 1–6 | `3` |
| Tone | Preset style or custom description | Witty |
| Enable on X/Twitter | Per-site toggle | On |
| Enable on Reddit | Per-site toggle | On |

## ▌Troubleshooting

| Issue | Fix |
|---|---|
| Ollama error 403 | Set `OLLAMA_ORIGINS=chrome-extension://*`, restart Ollama |
| Ollama error 404 — model not found | Reopen the popup, explicitly select the model, save again |
| Suggestions feel slow | First request loads the model into memory; later ones are faster. Smaller models respond quicker but write more generic text |
| Suggestions sound repetitive or stiff | Try a different tone preset or a larger, better-instruction-following model |

## ▌Project Structure

```
reply-ai/
├── manifest.json
├── shared-settings.js
├── background.js
├── content-common.js
├── content-twitter.js
├── content-reddit.js
├── content.css
├── popup.html
├── popup.js
└── popup.css
```

## ▌Privacy

No network requests beyond your local Ollama instance and the sites it reads posts from. No analytics, no telemetry, no remote logging.

## ▌License

MIT — use it, fork it, ship it.
