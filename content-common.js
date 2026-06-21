// Shared UI logic used by both content-twitter.js and content-reddit.js.

const AI_REPLY_PROCESSED_ATTR = "data-ai-reply-processed";

function requestSuggestions(postText, context) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "GET_SUGGESTIONS", postText, context },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background script."));
          return;
        }
        if (!response.ok) {
          reject(new Error(response.error || "Unknown error"));
          return;
        }
        resolve(response.suggestions);
      }
    );
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  });
}

function buildPanel() {
  const panel = document.createElement("div");
  panel.className = "ai-reply-panel";
  panel.style.display = "none";
  return panel;
}

function setPanelLoading(panel) {
  panel.innerHTML = "";
  const loading = document.createElement("div");
  loading.className = "ai-reply-loading";
  loading.textContent = "Asking your local model...";
  panel.appendChild(loading);
}

function setPanelError(panel, message) {
  panel.innerHTML = "";
  const error = document.createElement("div");
  error.className = "ai-reply-error";
  error.textContent = `Couldn't get suggestions: ${message}`;
  panel.appendChild(error);
}

function setPanelSuggestions(panel, suggestions) {
  panel.innerHTML = "";
  if (!suggestions || suggestions.length === 0) {
    setPanelError(panel, "Model returned no usable suggestions.");
    return;
  }
  suggestions.forEach((text) => {
    const item = document.createElement("div");
    item.className = "ai-reply-item";

    const span = document.createElement("span");
    span.className = "ai-reply-item-text";
    span.textContent = text;

    const button = document.createElement("button");
    button.className = "ai-reply-copy-btn";
    button.type = "button";
    button.textContent = "Copy";
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      copyToClipboard(text);
      button.textContent = "Copied!";
      setTimeout(() => (button.textContent = "Copy"), 1200);
    });

    item.appendChild(span);
    item.appendChild(button);
    panel.appendChild(item);
  });
}

/**
 * Attaches a "Suggest replies" button + results panel near a post.
 */
function attachSuggestButton(anchorEl, getTextFn, context, panelParent) {
  if (anchorEl.hasAttribute(AI_REPLY_PROCESSED_ATTR)) return;
  anchorEl.setAttribute(AI_REPLY_PROCESSED_ATTR, "true");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "ai-reply-suggest-btn";
  button.textContent = "💬 Suggest replies";

  const panel = buildPanel();
  const parent = panelParent || anchorEl.parentElement;

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = panel.style.display !== "none";
    if (isOpen) {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";
    setPanelLoading(panel);

    const text = (getTextFn() || "").trim();
    if (!text) {
      setPanelError(panel, "Couldn't find any text for this post.");
      return;
    }

    try {
      const suggestions = await requestSuggestions(text, context);
      setPanelSuggestions(panel, suggestions);
    } catch (err) {
      setPanelError(panel, err.message);
    }
  });

  anchorEl.appendChild(button);
  if (parent) parent.appendChild(panel);
  return { button, panel };
}