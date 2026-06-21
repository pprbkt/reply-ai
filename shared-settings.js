// Single source of truth for default settings + storage helpers.
// Loaded by background.js, popup.html, and both content scripts.

const DEFAULT_SETTINGS = {
  ollamaUrl: "http://localhost:11434",
  model: "llama3.1",
  numSuggestions: 3,
  tone: "witty",
  customTone: "",
  enabledOnTwitter: true,
  enabledOnReddit: true,
};

const TONE_PRESETS = {
  witty: "witty, a little playful, but still adds something substantive",
  supportive: "warm, encouraging, and supportive",
  professional: "professional, measured, and concise",
  sarcastic: "dry and sarcastic, but not mean-spirited",
  contrarian: "politely contrarian — raises a reasonable counterpoint",
  curious: "curious — asks a genuine follow-up question",
};

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_SETTINGS, (items) => resolve(items));
  });
}

function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set(settings, resolve);
  });
}

function resolveToneDescription(settings) {
  if (settings.tone === "custom" && settings.customTone.trim()) {
    return settings.customTone.trim();
  }
  return TONE_PRESETS[settings.tone] || TONE_PRESETS.witty;
}