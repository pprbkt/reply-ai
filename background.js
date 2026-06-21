importScripts("shared-settings.js");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_SUGGESTIONS") {
    handleGetSuggestions(message.postText, message.context)
      .then((suggestions) => sendResponse({ ok: true, suggestions }))
      .catch((err) => sendResponse({ ok: false, error: err.message || String(err) }));
    return true; // keep the message channel open for the async response
  }
  if (message?.type === "CHECK_OLLAMA") {
    checkOllama(message.ollamaUrl)
      .then((models) => sendResponse({ ok: true, models }))
      .catch((err) => sendResponse({ ok: false, error: err.message || String(err) }));
    return true;
  }
});

async function checkOllama(ollamaUrl) {
  const res = await fetch(`${ollamaUrl}/api/tags`);
  if (!res.ok) throw new Error(`Ollama responded with ${res.status}`);
  const data = await res.json();
  return (data.models || []).map((m) => m.name);
}

async function handleGetSuggestions(postText, context) {
  const settings = await getSettings();
  const tone = resolveToneDescription(settings);
  const n = Math.min(Math.max(parseInt(settings.numSuggestions, 10) || 3, 1), 6);

  const systemPrompt = [
    `You write short replies for social media, the way a real person quickly types on their phone — not a brand account, not a hype-man.`,
    `Tone for this batch: ${tone}.`,
    `Sound human: vary sentence length and structure across the ${n} replies. Don't force an exclamation mark or emoji into every line — most replies should have zero or one emoji, and at least one or two should have none at all.`,
    `Avoid stock openers like "Great job", "Looks like", "Can't wait", "Wow", or restating the post's topic back at the start of the sentence.`,
    `Each reply must be a complete, ready-to-post reply, under 240 characters, with no hashtags unless the original post uses them.`,
    `Do not wrap individual replies in their own brackets or quotes. Return ONLY one valid JSON array containing exactly ${n} plain strings — no markdown, no code fences, no per-line arrays, no explanation.`,
  ].join(" ");

  const userPrompt = `Platform: ${context || "social media"}\nOriginal post:\n"""\n${postText.slice(0, 2000)}\n"""\n\nGive ${n} distinct reply suggestions as a JSON array of strings.`;

  const res = await fetch(`${settings.ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: settings.model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options: { temperature: 0.8 },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data?.message?.content ?? "";
  return parseSuggestions(raw, n);
}

function parseSuggestions(raw, n) {
  const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();

  // Case 1: a single valid JSON array.
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, n);
    }
  } catch (_) {}

  // Case 2: a JSON array embedded somewhere in extra text.
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, n);
      }
    } catch (_) {}
  }

  // Case 3: model put each suggestion on its own line, sometimes as its own
  // single-item JSON array like ["some reply"]. Handle line by line.
  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
  const results = [];
  for (const line of lines) {
    if (/^\[[\s\S]*\]$/.test(line)) {
      try {
        const parsedLine = JSON.parse(line);
        if (Array.isArray(parsedLine)) {
          parsedLine.forEach((s) => results.push(String(s).trim()));
          continue;
        }
      } catch (_) {}
    }
    const stripped = line
      .replace(/^[\s\-\d.\)]+/, "")
      .replace(/^\[+|\]+$/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (stripped) results.push(stripped);
  }
  return results.filter(Boolean).slice(0, n);
}