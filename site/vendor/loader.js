(function () {
  var BASE = "/vendor/ripe";
  var path = (window.__RIPE_NATIVE_SOURCE_ROUTE__ || window.location.pathname).replace(/\/$/, "") || "/";

  if (window.__RIPE_LOADER_ACTIVE_PATH__ === path) return;
  window.__RIPE_LOADER_ACTIVE_PATH__ = path;

  var GLOBAL_STYLES = ["global/components", "global/theme", "global/card-hover"];
  var GLOBAL_SCRIPTS = ["global/theme-detector"];

  var PAGE_SCRIPTS = {
    "/": ["global/media-player", "home/bunny-player"],
    "/archive/writing-new-copy": ["writings/horizontal-feed"],
    "/case-studies-new-copy": [
      "case-studies/preview-follower",
      "case-studies/grid-list-toggle",
      "case-studies/mobile-filters",
      "case-studies/hover-theme",
    ],
    "/case-studies-new": [
      "case-studies/preview-follower",
      "case-studies/grid-list-toggle",
      "case-studies/mobile-filters",
      "case-studies/hover-theme",
    ],
  };

  var PAGE_STYLES = {
    "/archive/writing-new-copy": ["writings/horizontal-feed"],
    "/case-studies-new-copy": [
      "case-studies/list-view",
      "case-studies/grid-layout",
      "case-studies/hover-effects",
      "case-studies/mobile-filters",
      "case-studies/hover-theme",
    ],
    "/case-studies-new": [
      "case-studies/list-view",
      "case-studies/grid-layout",
      "case-studies/hover-effects",
      "case-studies/mobile-filters",
      "case-studies/hover-theme",
    ],
  };

  var PREFIX_SCRIPTS = {
    "/writing/": ["writings/horizontal-blog"],
    "/case-studies/": ["global/media-player", "case-studies/detail-builder"],
  };

  var PREFIX_STYLES = {
    "/writing/": ["writings/horizontal-blog"],
    "/case-studies/": ["case-studies/detail-builder"],
  };

  function unique(list) {
    return list.filter(function (item, index) {
      return list.indexOf(item) === index;
    });
  }

  function namesForPath(exactMap, prefixMap) {
    var names = exactMap[path] ? exactMap[path].slice() : [];
    Object.keys(prefixMap).forEach(function (prefix) {
      if (path.indexOf(prefix) === 0 || (path + "/").indexOf(prefix) === 0) {
        names = names.concat(prefixMap[prefix]);
      }
    });
    return unique(names);
  }

  function loadStyle(name) {
    var href = BASE + "/styles/" + name + ".css";
    if (document.querySelector('link[href="' + href + '"]')) return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(name) {
    return new Promise(function (resolve) {
      var src = BASE + "/scripts/" + name + ".js";
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  unique(GLOBAL_STYLES.concat(namesForPath(PAGE_STYLES, PREFIX_STYLES))).forEach(loadStyle);
  unique(GLOBAL_SCRIPTS.concat(namesForPath(PAGE_SCRIPTS, PREFIX_SCRIPTS))).reduce(function (chain, name) {
    return chain.then(function () {
      return loadScript(name);
    });
  }, Promise.resolve());
})();
