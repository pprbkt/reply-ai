(async function () {
  const settings = await getSettings();
  if (settings.enabledOnTwitter === false) return;

  function getTweetText(article) {
    const textEl = article.querySelector('[data-testid="tweetText"]');
    if (textEl) return textEl.innerText;
    return article.innerText.slice(0, 1000);
  }

  function processTweet(article) {
    const toolbar = article.querySelector('[role="group"]');
    const anchor = toolbar || article;
    attachSuggestButton(anchor, () => getTweetText(article), "Twitter/X", anchor.parentElement || article);
  }

  function scan() {
    document.querySelectorAll('article[data-testid="tweet"]').forEach((article) => {
      if (!article.hasAttribute("data-ai-reply-processed")) {
        processTweet(article);
      }
    });
  }

  scan();
  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();