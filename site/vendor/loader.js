/**
 * Ripe Studios Script Loader
 *
 * Add this once in Webflow Site Settings → Custom Code → Footer Code:
 *   <script src="https://ripe-studios.netlify.app/loader.js"></script>
 *
 * It auto-detects the current page path and loads matching scripts and styles.
 *
 * Dev mode: add ?dev=https://your-tunnel-url.trycloudflare.com
 * The tunnel URL is printed when you run ./dev.sh
 */
(function () {
  var PROD_BASE = '/vendor/ripe';

  var params = new URLSearchParams(window.location.search);
  var devUrl = params.get('dev');
  var base = devUrl || PROD_BASE;

  // Global styles loaded on every page
  var GLOBAL_STYLES = [
    'global/components',
    'global/theme',
    'global/card-hover'
  ];

  // Global scripts loaded on every page
  var GLOBAL_SCRIPTS = [
    'global/theme-detector'
  ];

  // Map URL paths to page-specific scripts and styles
  var PAGE_SCRIPTS = {
    '/': [
      'global/media-player',
      'home/bunny-player'
    ],
    '/archive/writing-new-copy': [
      'writings/horizontal-feed'
    ],
    '/case-studies-new-copy': [
      'case-studies/preview-follower',
      'case-studies/grid-list-toggle',
      'case-studies/mobile-filters',
      'case-studies/hover-theme'
    ],
    '/case-studies-new': [
      'case-studies/preview-follower',
      'case-studies/grid-list-toggle',
      'case-studies/mobile-filters',
      'case-studies/hover-theme'
    ]
  };

  var PAGE_STYLES = {
    '/archive/writing-new-copy': [
      'writings/horizontal-feed'
    ],
    '/case-studies-new-copy': [
      'case-studies/list-view',
      'case-studies/grid-layout',
      'case-studies/hover-effects',
      'case-studies/mobile-filters',
      'case-studies/hover-theme'
    ],
    '/case-studies-new': [
      'case-studies/list-view',
      'case-studies/grid-layout',
      'case-studies/hover-effects',
      'case-studies/mobile-filters',
      'case-studies/hover-theme'
    ]
  };

  // Prefix-based route matching (for /writings/[slug] etc.)
  var PREFIX_SCRIPTS = {
    '/writing/': ['writings/horizontal-blog'],
    '/case-studies/': ['global/media-player', 'case-studies/detail-builder']
  };

  var PREFIX_STYLES = {
    '/writing/': ['writings/horizontal-blog'],
    '/case-studies/': ['case-studies/detail-builder']
  };

  var PREFIX_EXTERNAL_SCRIPTS = {
    '/case-studies/': [
      {
        src: 'https://cdn.jsdelivr.net/npm/hls.js@1',
        global: 'Hls'
      }
    ]
  };

  var EXACT_EXTERNAL_SCRIPTS = {
    '/archive/writing-new-copy': [
      {
        src: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js',
        type: 'module',
        attributes: {
          'fs-list': ''
        }
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
        global: 'gsap'
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
        global: 'ScrollTrigger'
      }
    ]
  };

  // Match current path — exact match first, then prefix match
  var path = (window.__RIPE_NATIVE_SOURCE_ROUTE__ || window.location.pathname).replace(/\/$/, '') || '/';
  if (window.__RIPE_LOADER_ACTIVE_PATH__ === path) return;
  window.__RIPE_LOADER_ACTIVE_PATH__ = path;

  var scripts = PAGE_SCRIPTS[path];
  var styles = PAGE_STYLES[path];
  var externalScripts = EXACT_EXTERNAL_SCRIPTS[path] || [];

  var prefixes = Object.keys(PREFIX_SCRIPTS)
    .concat(Object.keys(PREFIX_STYLES))
    .concat(Object.keys(PREFIX_EXTERNAL_SCRIPTS))
    .filter(function (prefix, index, list) {
      return list.indexOf(prefix) === index;
    });

  for (var i = 0; i < prefixes.length; i++) {
    if (path.indexOf(prefixes[i]) === 0 || (path + '/').indexOf(prefixes[i]) === 0) {
      scripts = scripts || PREFIX_SCRIPTS[prefixes[i]];
      styles = styles || PREFIX_STYLES[prefixes[i]];
      externalScripts = externalScripts.concat(PREFIX_EXTERNAL_SCRIPTS[prefixes[i]] || []);
      break;
    }
  }

  var hasGlobal = GLOBAL_STYLES.length > 0 || GLOBAL_SCRIPTS.length > 0;
  if (!scripts && !styles && !hasGlobal) return;

  // --- Critical inline CSS (prevents layout shift) ---
  var criticalCSSRules = '';

  if (path === '/case-studies-new-copy' || path === '/case-studies-new') {
    criticalCSSRules +=
      '.case-studies-wrapper.is-grid { opacity: 0; }' +
      '.cases_listview-wrapper { opacity: 0; }' +

      '.case-studies-wrapper.is-grid { width: 100% !important; }' +
      '.masonry-item { min-width: 0 !important; }' +
      '.masonry-item:nth-child(9n) .large-card-description { display: block; }' +
      '.masonry-item:nth-child(9n) .content-wrap .casestudy_description { display: none; }' +
      '.masonry-item:nth-child(9n) {' +
        'grid-column: 1 / -1; display: flex; flex-direction: column;' +
        'max-height: 100vh; padding: 8rem 12rem; justify-content: center; align-items: center;' +
      '}' +
      '.masonry-item:nth-child(9n) .feed_card-wrap {' +
        'width: 100%; display: flex !important; flex-direction: row !important;' +
        'justify-content: center !important; align-items: center !important; gap: 3.5rem;' +
      '}' +
      '.masonry-item:nth-child(9n) .img-wrap {' +
        'width: calc((100cqi - 3rem) / 4) !important; flex-shrink: 0 !important; align-self: center !important;' +
      '}' +
      '.masonry-item:nth-child(9n) .casestudy_coverimage {' +
        'width: 100% !important; max-height: none !important; aspect-ratio: 2/3 !important;' +
      '}' +
      '.masonry-item:nth-child(9n) .content-wrap {' +
        'width: 150px; display: flex !important; flex-direction: column !important;' +
        'justify-content: center !important; align-items: flex-end !important;' +
        'align-self: center !important; order: -9999; overflow: visible; margin-top: 0;' +
      '}' +
      '.masonry-item:nth-child(9n) .casestudy_title-text { width: 100%; text-align: right; }' +
      '.masonry-item:nth-child(9n) .collection-list-wrapper-7 {' +
        'width: 150px; display: flex !important; flex-direction: column !important;' +
        'justify-content: center !important; align-self: center !important; order: 9999;' +
      '}' +
      '.masonry-item:nth-child(9n) .case_study-tag { width: 100%; }' +

      '@media screen and (max-width: 1440px) {' +
        '.masonry-item:nth-child(9n) { padding: 6rem 8rem; }' +
      '}' +
      '@media screen and (max-width: 1024px) {' +
        '.masonry-item:nth-child(9n) { padding: 4rem 4rem; }' +
      '}' +
      '@media screen and (max-width: 768px) {' +
        '.masonry-item:nth-child(9n) { padding: 6rem 1.5rem; }' +
        '.masonry-item:nth-child(9n) .feed_card-wrap { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem; }' +
        '.masonry-item:nth-child(9n) .large-card-description { order: -4; font-size: 2rem !important; margin-bottom: 0.75rem !important; }' +
        '.masonry-item:nth-child(9n) .collection-list-wrapper-7 { width: 100%; order: -3; margin-top: 0; align-self: center !important; align-items: center !important; justify-content: center !important; text-align: center; }' +
        '.masonry-item:nth-child(9n) .img-wrap { width: calc((100% - 1rem) / 2) !important; order: -2; margin-top: 1.5rem; }' +
        '.masonry-item:nth-child(9n) .content-wrap { width: calc((100% - 1rem) / 2) !important; align-items: flex-start !important; order: -1; margin-top: 0.5rem; }' +
        '.masonry-item:nth-child(9n) .casestudy_title-text { text-align: left; }' +
      '}' +
      '@media screen and (max-width: 480px) {' +
        '.masonry-item:nth-child(9n) { padding: 5rem 1rem; }' +
      '}' +

      '@media screen and (min-width: 768px) {' +
        '.mobile-categories-btn, .mobile-filter-close, .mobile-filter-all { display: none !important; }' +
      '}';
  }

  if (
    path === '/archive/writing-new-copy' &&
    !document.querySelector('[data-ssr-writing-feed="true"]')
  ) {
    criticalCSSRules +=
      '[data-horizontal-scroll-wrap] { opacity: 0 !important; }' +
      '.writings-hidden-cms {' +
        'position: absolute !important; width: 1px !important; height: 1px !important;' +
        'padding: 0 !important; margin: -1px !important; overflow: hidden !important;' +
        'clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;' +
      '}';
  }

  if (path.indexOf('/case-studies/') === 0) {
    criticalCSSRules +=
      '[data-case-study-rows-source],' +
      '[data-case-study-testimonial-source],' +
      '[data-case-study-team-source] {' +
        'position: absolute !important; width: 1px !important; height: 1px !important;' +
        'padding: 0 !important; margin: -1px !important; overflow: hidden !important;' +
        'clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;' +
      '}' +
      '.main > *:not([data-case-detail-shell]) { display: none !important; }' +
      '.main + .w-dyn-list {' +
        'position: absolute !important; width: 1px !important; height: 1px !important;' +
        'padding: 0 !important; margin: -1px !important; overflow: hidden !important;' +
        'clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;' +
      '}';
  }

  if (criticalCSSRules) {
    var criticalCSS = document.createElement('style');
    criticalCSS.id = 'ripe-critical-css';
    criticalCSS.textContent = criticalCSSRules;
    document.head.appendChild(criticalCSS);
  }

  // --- Dev mode ---
  if (devUrl) {
    console.log('[Ripe Loader] Dev mode — loading from ' + devUrl);
    console.log('[Ripe Loader] Page: ' + path);

    var devStyle = document.createElement('style');
    devStyle.textContent = '.w-webflow-badge { display: none !important; }';
    document.head.appendChild(devStyle);

    var badge = document.createElement('div');
    badge.setAttribute('data-ripe-dev-badge', '');
    badge.textContent = 'DEV';
    badge.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:99999;background:#ff3b30;color:#fff;font:bold 11px/1 system-ui;padding:6px 10px;border-radius:6px;opacity:0.85;pointer-events:auto;cursor:pointer;';
    document.body.appendChild(badge);
  }

  // --- Load styles with FOUC tracking ---
  var totalCSS = (GLOBAL_STYLES.length) + (styles ? styles.length : 0);
  var loadedCSS = 0;
  var foucRevealed = false;

  function revealContent() {
    if (foucRevealed) return;
    foucRevealed = true;
    // Remove FOUC hiding rules — let external CSS take over
    var wrapper = document.querySelector('.case-studies-wrapper.is-grid');
    var listWrapper = document.querySelector('.cases_listview-wrapper');
    if (wrapper) wrapper.style.setProperty('opacity', '1');
    if (listWrapper) listWrapper.style.setProperty('opacity', '1');
    // Add transition for smooth reveal
    if (wrapper) wrapper.style.setProperty('transition', 'opacity 0.3s ease');
    if (listWrapper) listWrapper.style.setProperty('transition', 'opacity 0.3s ease');
    console.log('[Ripe Loader] CSS loaded — content revealed');
  }

  function onCSSLoad() {
    loadedCSS++;
    if (loadedCSS >= totalCSS) revealContent();
  }

  // Safety net: reveal content after 1.5s regardless (Safari may not fire onload on <link>)
  setTimeout(revealContent, 1500);

  // Load global styles
  GLOBAL_STYLES.forEach(function (name) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + '/styles/' + name + '.css';
    link.onload = onCSSLoad;
    link.onerror = onCSSLoad;
    document.head.appendChild(link);
  });

  // Load page-specific styles
  if (styles) {
    styles.forEach(function (name) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + '/styles/' + name + '.css';
      link.onload = onCSSLoad;
      link.onerror = onCSSLoad;
      document.head.appendChild(link);
    });
  }

  // --- Dependency gates ---

  function waitForGlobal(name, timeout) {
    return new Promise(function (resolve, reject) {
      if (window[name]) { resolve(); return; }
      var elapsed = 0;
      var interval = setInterval(function () {
        if (window[name]) { clearInterval(interval); resolve(); return; }
        elapsed += 50;
        if (elapsed >= timeout) {
          clearInterval(interval);
          reject(new Error(name + ' not found after ' + timeout + 'ms'));
        }
      }, 50);
    });
  }

  function waitForGsap(timeout) {
    return waitForGlobal('gsap', timeout);
  }

  function waitForFinsweet(timeout) {
    return new Promise(function (resolve, reject) {
      var start = performance.now();
      function check() {
        var list = document.querySelector('[fs-list-element="list"]');
        if (list && list.children.length > 0) { resolve(); return; }
        if (performance.now() - start >= timeout) {
          reject(new Error('Finsweet list not found after ' + timeout + 'ms'));
          return;
        }
        requestAnimationFrame(check);
      }
      check();
    });
  }

  // --- Sequential script loading ---

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('[Ripe Loader] Failed to load: ' + url)); };
      document.head.appendChild(s);
    });
  }

  function normalizeUrl(url) {
    var link = document.createElement('a');
    link.href = url;
    return link.href;
  }

  function findExistingScript(url) {
    var normalizedUrl = normalizeUrl(url);
    var existing = document.getElementsByTagName('script');
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].src && normalizeUrl(existing[i].src) === normalizedUrl) {
        return existing[i];
      }
    }
    return null;
  }

  function loadExternalScript(dep) {
    if (dep.global && window[dep.global]) {
      return Promise.resolve();
    }

    var existing = findExistingScript(dep.src);
    if (existing) {
      if (!dep.global) return Promise.resolve();
      return waitForGlobal(dep.global, 5000);
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = dep.src;
      if (dep.type) {
        script.type = dep.type;
      }
      if (dep.attributes) {
        Object.keys(dep.attributes).forEach(function (name) {
          script.setAttribute(name, dep.attributes[name]);
        });
      }
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error('[Ripe Loader] Failed to load: ' + dep.src));
      };
      document.head.appendChild(script);
    }).then(function () {
      if (!dep.global) return;
      return waitForGlobal(dep.global, 5000);
    });
  }

  function loadExternalScripts(deps) {
    if (!deps || deps.length === 0) return Promise.resolve();
    return deps.reduce(function (chain, dep) {
      return chain.then(function () {
        console.log('[Ripe Loader] Loading external:', dep.src);
        return loadExternalScript(dep);
      });
    }, Promise.resolve());
  }

  // Load global scripts immediately (no dependency gates needed)
  if (GLOBAL_SCRIPTS.length > 0) {
    GLOBAL_SCRIPTS.reduce(function (chain, name) {
      return chain.then(function () {
        var url = base + '/scripts/' + name + '.js';
        console.log('[Ripe Loader] Loading global:', name);
        return loadScript(url);
      });
    }, Promise.resolve()).catch(function (err) {
      console.error('[Ripe Loader]', err.message);
    });
  }

  // Load page-specific scripts with dependency gates
  if (scripts) {
    console.log('[Ripe Loader] Waiting for dependencies…');

    var isWriting = path.indexOf('/writing/') === 0;
    var isCaseStudyDetail = path.indexOf('/case-studies/') === 0;
    var usesDefaultDependencyGate = !isWriting && path !== '/archive/writing-new-copy' && !isCaseStudyDetail;
    var scriptChain = Promise.resolve()
      .then(function () {
        return loadExternalScripts(externalScripts);
      })
      .catch(function (err) {
        console.warn('[Ripe Loader]', err.message, '— continuing without all external scripts');
      });

    if (usesDefaultDependencyGate) {
      scriptChain = scriptChain
        .then(function () {
          return Promise.all([waitForGsap(5000), waitForFinsweet(5000)]);
        })
        .catch(function (err) {
          console.warn('[Ripe Loader]', err.message, '— loading scripts anyway');
        });
    }

    scriptChain
      .then(function () {
        console.log('[Ripe Loader] Dependencies ready — loading scripts sequentially');
        return scripts.reduce(function (chain, name) {
          return chain.then(function () {
            var url = base + '/scripts/' + name + '.js';
            console.log('[Ripe Loader] Loading:', name);
            return loadScript(url);
          });
        }, Promise.resolve());
      })
      .then(function () {
        console.log('[Ripe Loader] All scripts loaded');
      })
      .catch(function (err) {
        console.error('[Ripe Loader]', err.message);
      });
  }
})();
