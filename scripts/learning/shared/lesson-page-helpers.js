(function initBridgeLessonPageHelpers(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLessonPageHelpers = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonPageHelpers(root) {
  "use strict";

  function hasSearchParam(name, location = root.location) {
    return new URLSearchParams(location?.search || "").has(name);
  }

  function relativeHref(href) {
    const url = href instanceof URL ? href : localUrl(href);
    if (!url) return String(href || "");
    const current = localUrl(root.location?.href || "http://localhost/");
    if (!current || url.origin !== current.origin) return url.href;
    return `${relativePath(current.pathname, url.pathname)}${url.search}${url.hash}`;
  }

  function rootRelativeHref(href) {
    const url = href instanceof URL ? href : localUrl(href);
    if (!url) return String(href || "");
    return `${url.pathname.replace(/^\/+/, "")}${url.search}${url.hash}`;
  }

  function localUrl(href, base = root.location?.href || "http://localhost/") {
    try {
      return new URL(String(href || ""), base);
    } catch (_error) {
      return null;
    }
  }

  function preserveSearchParamOnLinks(selector, name, value = "1", doc = root.document) {
    if (!doc) return;
    const origin = root.location?.origin || localUrl(root.location?.href)?.origin || "http://localhost";
    doc.querySelectorAll(selector).forEach((link) => {
      const href = localUrl(link.getAttribute("href"));
      if (!href || href.origin !== origin) return;
      href.searchParams.set(name, value);
      link.href = relativeHref(href);
    });
  }

  function preserveTestHooksOnLinks(selector, doc = root.document) {
    if (!hasSearchParam("testHooks")) return;
    preserveSearchParamOnLinks(selector, "testHooks", "1", doc);
  }

  function relativePath(fromPath, toPath) {
    const fromDir = fromPath.endsWith("/") ? fromPath : fromPath.replace(/[^/]*$/, "");
    const fromParts = fromDir.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    const toParts = toPath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    let shared = 0;
    while (shared < fromParts.length && shared < toParts.length && fromParts[shared] === toParts[shared]) {
      shared += 1;
    }
    const up = fromParts.slice(shared).map(() => "..");
    const down = toParts.slice(shared);
    return [...up, ...down].join("/") || toParts.at(-1) || ".";
  }

  return {
    hasSearchParam,
    localUrl,
    preserveSearchParamOnLinks,
    preserveTestHooksOnLinks,
    relativeHref,
    rootRelativeHref
  };
});
