(async function () {
  const settings = await getSettings();
  if (settings.enabledOnReddit === false) return;

  function getNewRedditPostText(post) {
    const title = post.getAttribute("post-title") || "";
    const body = post.querySelector('[slot="text-body"]');
    const bodyText = body ? body.innerText : "";
    return [title, bodyText].filter(Boolean).join("\n\n");
  }

  function getOldRedditPostText(thing) {
    const titleEl = thing.querySelector("a.title");
    const title = titleEl ? titleEl.innerText : "";
    const bodyEl = thing.querySelector(".usertext-body .md");
    const body = bodyEl ? bodyEl.innerText : "";
    return [title, body].filter(Boolean).join("\n\n");
  }

  function attachButtonBehavior(button, panelParent, getTextFn, context) {
    const panel = buildPanel();
    panelParent.appendChild(panel);

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
  }

  function processNewRedditPost(post) {
    if (post.hasAttribute("data-ai-reply-processed")) return;
    post.setAttribute("data-ai-reply-processed", "true");

    const wrapper = document.createElement("div");
    wrapper.className = "ai-reply-wrapper-reddit";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ai-reply-suggest-btn";
    button.textContent = "💬 Suggest replies";
    wrapper.appendChild(button);

    post.insertAdjacentElement("afterend", wrapper);
    attachButtonBehavior(button, wrapper, () => getNewRedditPostText(post), "Reddit");
  }

  function processOldRedditPost(thing) {
    if (thing.hasAttribute("data-ai-reply-processed")) return;
    thing.setAttribute("data-ai-reply-processed", "true");

    const buttonsRow = thing.querySelector(".flat-list.buttons");
    const anchor = buttonsRow || thing;

    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ai-reply-suggest-btn ai-reply-suggest-btn-old";
    button.textContent = "💬 Suggest replies";
    li.appendChild(button);
    anchor.appendChild(li);

    attachButtonBehavior(button, thing, () => getOldRedditPostText(thing), "Reddit");
  }

  function scan() {
    document.querySelectorAll("shreddit-post").forEach(processNewRedditPost);
    document.querySelectorAll("div.thing[data-fullname]").forEach(processOldRedditPost);
  }

  scan();
  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();