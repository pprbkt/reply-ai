const els = {
  ollamaUrl: document.getElementById("ollamaUrl"),
  model: document.getElementById("model"),
  checkBtn: document.getElementById("checkBtn"),
  connectionStatus: document.getElementById("connectionStatus"),
  numSuggestions: document.getElementById("numSuggestions"),
  tone: document.getElementById("tone"),
  customTone: document.getElementById("customTone"),
  enabledOnTwitter: document.getElementById("enabledOnTwitter"),
  enabledOnReddit: document.getElementById("enabledOnReddit"),
  saveBtn: document.getElementById("saveBtn"),
  saveStatus: document.getElementById("saveStatus"),
};

function populateModelSelect(models, selected) {
  els.model.innerHTML = "";
  const list = models && models.length ? models : [selected].filter(Boolean);
  list.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    els.model.appendChild(opt);
  });
  // If the previously saved model isn't in the live list, keep it selectable but don't
  // force the user back onto it — prefer an actual found model instead.
  const fallback = list.includes(selected) ? selected : (list[0] ?? "");
  if (selected && !list.includes(selected)) {
    const opt = document.createElement("option");
    opt.value = selected;
    opt.textContent = `${selected} (not found)`;
    els.model.appendChild(opt);
  }
  els.model.value = fallback;
}

async function loadIntoForm() {
  const settings = await getSettings();
  els.ollamaUrl.value = settings.ollamaUrl;
  els.numSuggestions.value = settings.numSuggestions;
  els.tone.value = settings.tone;
  els.customTone.value = settings.customTone;
  els.enabledOnTwitter.checked = settings.enabledOnTwitter;
  els.enabledOnReddit.checked = settings.enabledOnReddit;
  els.customTone.style.display = settings.tone === "custom" ? "block" : "none";
  populateModelSelect([], settings.model);
}

els.tone.addEventListener("change", () => {
  els.customTone.style.display = els.tone.value === "custom" ? "block" : "none";
});

els.checkBtn.addEventListener("click", async () => {
  els.connectionStatus.textContent = "Checking...";
  els.connectionStatus.className = "hint";
  chrome.runtime.sendMessage(
    { type: "CHECK_OLLAMA", ollamaUrl: els.ollamaUrl.value.trim() },
    (response) => {
      if (!response || !response.ok) {
        els.connectionStatus.textContent = `Couldn't reach Ollama: ${response?.error || "unknown error"}`;
        els.connectionStatus.className = "hint error";
        return;
      }
      els.connectionStatus.textContent = `Connected. ${response.models.length} model(s) found.`;
      els.connectionStatus.className = "hint success";
      populateModelSelect(response.models, els.model.value);
    }
  );
});

els.saveBtn.addEventListener("click", async () => {
  const settings = {
    ollamaUrl: els.ollamaUrl.value.trim() || DEFAULT_SETTINGS.ollamaUrl,
    model: els.model.value.trim() || DEFAULT_SETTINGS.model,
    numSuggestions: parseInt(els.numSuggestions.value, 10) || DEFAULT_SETTINGS.numSuggestions,
    tone: els.tone.value,
    customTone: els.customTone.value,
    enabledOnTwitter: els.enabledOnTwitter.checked,
    enabledOnReddit: els.enabledOnReddit.checked,
  };
  await saveSettings(settings);
  els.saveStatus.textContent = "Saved.";
  els.saveStatus.className = "hint success";
  setTimeout(() => (els.saveStatus.textContent = ""), 1800);
});

loadIntoForm();