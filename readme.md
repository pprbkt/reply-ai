```
██████╗ ███████╗██████╗ ██╗  ██╗   ██╗     █████╗ ██╗
██╔══██╗██╔════╝██╔══██╗██║  ╚██╗ ██╔╝    ██╔══██╗██║
██████╔╝█████╗  ██████╔╝██║   ╚████╔╝     ███████║██║
██╔══██╗██╔══╝  ██╔═══╝ ██║    ╚██╔╝      ██╔══██║██║
██║  ██║███████╗██║     ███████╗██║       ██║  ██║██║
╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝╚═╝       ╚═╝  ╚═╝╚═╝
```

**Reply suggestions for X/Twitter & Reddit** • **Generated locally via Ollama** • **Zero cloud calls**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-000000?style=for-the-badge&logo=googlechrome&logoColor=white)
![Ollama](https://img.shields.io/badge/Model_Runtime-Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![Privacy](https://img.shields.io/badge/100%25-Local-000000?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ▌ About

A lightweight Chrome extension that reads the post in front of you and drafts a few ready-to-post replies — written entirely by a model running in your own Ollama instance. No API keys, no cloud inference, no telemetry.

**Built for:** people who reply a lot and want a faster first draft, without handing their feed to a third-party API.
**Philosophy:** local-first, model-agnostic, no dark patterns.

## ▌ Tech Stack

```
Runtime        Chrome Extension (Manifest V3) • Service Worker
Inference      Ollama • any local chat model (qwen2.5, llama3.2, mistral, gemma2, lfm2.5 ...)
Detection      MutationObserver • DOM scraping (X/Twitter, Reddit — new & old)
UI             Vanilla JS • CSS custom properties
```

## ▌ How It Works

```
  content script                 background worker                 ollama
  (reads post text)      send       (builds prompt,         POST    (your local
  twitter.com / x.com  ────────▶     calls Ollama)        ─────────▶ model)
  reddit.com            ◀────────                          ◀─────────
                         suggestions                          JSON reply
```

1. A `MutationObserver` watches the feed and attaches a suggestion control to each post as it loads.
2. Clicking it sends the post's text to the background service worker.
3. The worker builds a prompt — tone, suggestion count, platform — and calls Ollama's `/api/chat` endpoint.
4. The response is parsed into clean, individual suggestions and rendered beneath the post.

Everything above happens on your machine. There is no remote backend.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ▌ Features

- **Inline suggestions** — a small control appears under every post on your feed.
- **Fully local** — every request goes to `http://localhost:11434`. Nothing is sent to a third party.
- **Model-agnostic** — works with anything pulled into Ollama. Switch models from the popup, no code changes.
- **Tunable tone** — witty, supportive, professional, sarcastic, politely contrarian, curious, or a custom description.
- **One-click copy** — drop any suggestion straight into the native reply box.
- **Per-site control** — enable or disable independently for X/Twitter and Reddit.

## ▌ Installation

**1. Set up Ollama**

```bash
ollama pull qwen2.5:7b-instruct
```

Allow extension requests to reach Ollama:

| Platform | Steps |
|---|---|
| Windows | **Environment Variables** → *Edit environment variables for your account* → add `OLLAMA_ORIGINS` = `chrome-extension://*` → restart Ollama |
| macOS | `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"` → restart Ollama |
| Linux | Add `Environment="OLLAMA_ORIGINS=chrome-extension://*"` to the `ollama.service` unit → `sudo systemctl restart ollama` |

**2. Load the extension**

```bash
chrome://extensions  →  Developer mode  →  Load unpacked
```

**3. Configure**

Open the popup → **Check connection** → pick a model → set tone & count → **Save settings**.

## ▌ Usage

Browse `x.com`, `twitter.com`, `www.reddit.com`, or `old.reddit.com`. A **Suggest replies** control appears on each post — click it, then **Copy** the suggestion you want into the native reply box.

## ▌ Configuration

| Setting | Description | Default |
|---|---|---|
| Ollama URL | Address of the local Ollama server | `http://localhost:11434` |
| Model | Any model available via `ollama list` | `llama3.1` |
| Suggestion count | Replies generated per post, 1–6 | `3` |
| Tone | Preset style or custom description | Witty |
| Enable on X/Twitter | Toggle per site | On |
| Enable on Reddit | Toggle per site | On |

## ▌ Troubleshooting

**Ollama error 403**
Ollama is rejecting the extension's origin. Set `OLLAMA_ORIGINS=chrome-extension://*`, then restart Ollama.

**Ollama error 404 — model not found**
The saved model wasn't actually selected after checking the connection. Reopen the popup, choose it explicitly, and save again.

**Suggestions feel slow**
First request after Ollama starts loads the model into memory — later requests are faster. Smaller models respond quicker but write more generic text; larger models are slower but more natural.

**Suggestions sound repetitive or stiff**
Try a different tone preset, write a custom one, or move to a larger, better-instruction-following model.

## ▌ Project Structure

```
ai-reply-extension/
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

## ▌ Privacy

The extension makes no network requests beyond your local Ollama instance and the sites it reads posts from. No analytics, no telemetry, no remote logging.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ▌ License

MIT — use it, fork it, ship it.

`Last updated: June 2026`