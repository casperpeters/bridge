(function initLessonCardsModule(global) {
  const DEFAULTS = {
    pageSelector: "[data-lesson-card-page]",
    cardSelector: "[data-lesson-card]",
    navSelector: "[data-lesson-card-nav] a[href^='#']",
    previousSelector: "[data-lesson-previous]",
    nextSelector: "[data-lesson-next]",
    positionSelector: "[data-lesson-card-position]",
    titleSelector: "[data-lesson-card-title]",
    activeClass: "is-active-lesson-card"
  };

  function initAll(root = global.document) {
    if (!root) return [];
    return [...root.querySelectorAll(DEFAULTS.pageSelector)]
      .map((page) => init(page))
      .filter(Boolean);
  }

  function init(page, options = {}) {
    if (!page || page.dataset.lessonCardsReady === "true") return null;

    const config = { ...DEFAULTS, ...options };
    const ownerDocument = page.ownerDocument || global.document;
    const ownerWindow = ownerDocument?.defaultView || global;
    const cards = [...page.querySelectorAll(config.cardSelector)];
    if (!cards.length) return null;

    const links = [...page.querySelectorAll(config.navSelector)];
    const previousButton = page.querySelector(config.previousSelector);
    const nextButton = page.querySelector(config.nextSelector);
    const position = page.querySelector(config.positionSelector);
    const title = page.querySelector(config.titleSelector);
    let activeIndex = indexForHash(ownerWindow?.location?.hash || "");

    page.dataset.lessonCardsReady = "true";

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetIndex = indexForHash(link.getAttribute("href") || "");
        if (targetIndex < 0) return;
        event.preventDefault();
        show(targetIndex, { updateHash: true, scroll: true });
      });
    });

    previousButton?.addEventListener("click", () => {
      show(activeIndex - 1, { updateHash: true, scroll: true });
    });

    nextButton?.addEventListener("click", () => {
      show(activeIndex + 1, { updateHash: true, scroll: true });
    });

    ownerWindow?.addEventListener("hashchange", () => {
      const targetIndex = indexForHash(ownerWindow.location.hash);
      if (targetIndex >= 0) show(targetIndex, { updateHash: false, scroll: false });
    });

    show(activeIndex >= 0 ? activeIndex : 0, { updateHash: Boolean(ownerWindow?.location?.hash), scroll: false });

    return {
      show,
      getActiveIndex: () => activeIndex,
      getActiveCard: () => cards[activeIndex] || null
    };

    function show(index, { updateHash = false, scroll = false } = {}) {
      activeIndex = Math.max(0, Math.min(cards.length - 1, index));
      const activeCard = cards[activeIndex];

      cards.forEach((card, cardIndex) => {
        const isActive = cardIndex === activeIndex;
        card.hidden = !isActive;
        card.classList.toggle(config.activeClass, isActive);
      });

      const activeTitle = activeCard?.querySelector("h2")?.textContent?.trim() || "Leskaart";
      if (position) position.textContent = `Kaart ${activeIndex + 1} van ${cards.length}`;
      if (title) title.textContent = activeTitle;
      if (previousButton) previousButton.disabled = activeIndex <= 0;
      if (nextButton) nextButton.disabled = activeIndex >= cards.length - 1;

      links.forEach((link) => {
        const current = link.getAttribute("href") === `#${activeCard?.id}`;
        if (current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });

      if (updateHash && activeCard?.id && ownerWindow?.history) {
        const nextUrl = new URL(ownerWindow.location.href);
        nextUrl.hash = activeCard.id;
        ownerWindow.history.replaceState(null, "", nextUrl);
      }

      if (scroll) {
        activeCard?.scrollIntoView({ block: "start", behavior: "smooth" });
      }

      const LessonCardChangeEvent = ownerWindow?.CustomEvent || global.CustomEvent;
      if (typeof LessonCardChangeEvent === "function") {
        page.dispatchEvent(new LessonCardChangeEvent("lesson-card-change", {
          detail: {
            activeCard,
            activeIndex,
            totalCards: cards.length
          }
        }));
      }
    }

    function indexForHash(hash) {
      const targetId = decodeHash(hash);
      if (!targetId) return -1;
      return cards.findIndex((card) => card.id === targetId);
    }
  }

  function decodeHash(hash) {
    const text = String(hash || "");
    const hashIndex = text.indexOf("#");
    const raw = (hashIndex >= 0 ? text.slice(hashIndex + 1) : text).trim();
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch (_error) {
      return raw;
    }
  }

  const api = { init, initAll };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.BridgeLessonCards = api;

  if (global.document) {
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", () => initAll(global.document));
    } else {
      initAll(global.document);
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
