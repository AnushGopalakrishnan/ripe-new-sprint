function initHoverTheme() {
  var mq = window.matchMedia('(max-width: 768px)');
  var gridContainer = document.querySelector('.case-studies-wrapper.is-grid');
  if (!gridContainer) return;

  var body = document.body;
  var overlay = null;
  var activeHex = null;
  var accentRgb = null;
  var rafId = null;
  var lastHoveredCard = null;
  var fadeTimer = null;
  var themedEls = [];
  var mutationObserver = null;
  var boundCards = [];

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function getLuminance(r, g, b) {
    var rs = r / 255, gs = g / 255, bs = b / 255;
    rs = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    gs = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    bs = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function needsLightText(yFraction) {
    var t = Math.min(yFraction / 0.7, 1);
    var r = Math.round(accentRgb[0] + (255 - accentRgb[0]) * t);
    var g = Math.round(accentRgb[1] + (255 - accentRgb[1]) * t);
    var b = Math.round(accentRgb[2] + (255 - accentRgb[2]) * t);
    return getLuminance(r, g, b) <= 0.45;
  }

  function collectThemedElements() {
    themedEls.forEach(function (item) { item._lastLight = undefined; });
    themedEls = [];
    document.querySelectorAll('.ripe_logo path, .nav_menu-btn, .nav_circle').forEach(function (el) {
      themedEls.push({ el: el, type: 'nav' });
    });
    document.querySelectorAll('.checkbox-label, .grid-switch').forEach(function (el) {
      themedEls.push({ el: el, type: 'filter' });
    });
    document.querySelectorAll('.grid-toggle').forEach(function (el) {
      themedEls.push({ el: el, type: 'select' });
    });
    document.querySelectorAll('.horizontal-rule').forEach(function (el) {
      themedEls.push({ el: el, type: 'divider' });
    });
    gridContainer.querySelectorAll('.masonry-item').forEach(function (card) {
      card.querySelectorAll('.casestudy_title-text, .casestudy_description, .large-card-description, .link').forEach(function (el) {
        themedEls.push({ el: el, card: card, type: 'card-text' });
      });
    });
  }

  function applyItemColor(item, light) {
    if (item._lastLight === light) return;
    item._lastLight = light;

    if (item.type === 'nav') {
      if (item.el.tagName === 'path') {
        item.el.style.setProperty('fill', light ? '#ffffff' : '#0a0a0a', 'important');
      } else if (item.el.classList.contains('nav_circle')) {
        item.el.style.setProperty('background-color', light ? '#ffffff' : '#0a0a0a', 'important');
      } else {
        item.el.style.setProperty('color', light ? '#ffffff' : '#0a0a0a', 'important');
      }
    } else if (item.type === 'select') {
      item.el.classList.toggle('is-inverted', light);
    } else if (item.type === 'filter') {
      item.el.style.setProperty('color', light ? '#ffffff' : '#0a0a0a', 'important');
    } else if (item.type === 'divider') {
      item.el.style.setProperty('border-color', light ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,10,0.3)', 'important');
    } else if (item.type === 'card-text') {
      var isSecondary = !item.el.classList.contains('casestudy_title-text') && !item.el.classList.contains('large-card-description');
      if (isSecondary) {
        item.el.style.setProperty('color', light ? 'rgba(255,255,255,0.6)' : 'rgba(10,10,10,0.6)', 'important');
      } else {
        item.el.style.setProperty('color', light ? '#ffffff' : '#0a0a0a', 'important');
      }
    }
  }

  function updateColors() {
    if (!activeHex) return;

    var vh = window.innerHeight;

    themedEls.forEach(function (item) {
      var rect = item.el.getBoundingClientRect();
      var yFraction = Math.max(0, Math.min(1, rect.top / vh));
      var light = needsLightText(yFraction);
      applyItemColor(item, light);
    });

    rafId = requestAnimationFrame(updateColors);
  }

  function clearInlineStyles() {
    themedEls.forEach(function (item) {
      if (item.el.tagName === 'path') {
        item.el.style.removeProperty('fill');
      } else if (item.el.classList.contains('nav_circle')) {
        item.el.style.removeProperty('background-color');
      } else if (item.type === 'divider') {
        item.el.style.removeProperty('border-color');
      } else if (item.type === 'select') {
        item.el.classList.remove('is-inverted');
      } else {
        item.el.style.removeProperty('color');
      }
    });
  }

  function applyTheme(hex) {
    clearTimeout(fadeTimer);
    body.classList.remove('theme-fading');
    activeHex = hex;
    accentRgb = hexToRgb(hex);
    body.style.setProperty('--theme-bg', hex);
    body.classList.add('theme-active');
    collectThemedElements();
    if (!rafId) rafId = requestAnimationFrame(updateColors);
  }

  function clearTheme() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    activeHex = null;
    accentRgb = null;
    lastHoveredCard = null;

    body.classList.remove('theme-active');
    body.classList.add('theme-fading');

    themedEls.forEach(function (item) {
      if (item.el.tagName === 'path') {
        item.el.style.setProperty('fill', '#0a0a0a', 'important');
      } else if (item.el.classList.contains('nav_circle')) {
        item.el.style.setProperty('background-color', '#0a0a0a', 'important');
      } else if (item.type === 'divider') {
        item.el.style.setProperty('border-color', 'rgba(10,10,10,0.3)', 'important');
      } else if (item.type === 'select') {
        item.el.classList.remove('is-inverted');
      } else {
        item.el.style.setProperty('color', '#0a0a0a', 'important');
      }
    });

    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(function () {
      body.classList.remove('theme-fading');
      clearInlineStyles();
      body.style.removeProperty('--theme-bg');
    }, 450);
  }

  function getCardAccentColor(card) {
    var accentNode = card.querySelector('[data-accent-color]');
    if (accentNode && accentNode.dataset.accentColor) {
      return accentNode.dataset.accentColor;
    }

    var cardColor = card.getAttribute('data-color');
    if (cardColor) return cardColor;

    var overlayNode = card.querySelector('.color_overlay');
    if (overlayNode) {
      var overlayColor = overlayNode.style.backgroundColor || window.getComputedStyle(overlayNode).backgroundColor;
      if (overlayColor) return overlayColor;
    }

    return null;
  }

  // Store event listener references for cleanup
  function handleMouseEnter(card) {
    return function () {
      lastHoveredCard = card;
      gridContainer.querySelectorAll('.masonry-item.is-hovered').forEach(function (el) {
        el.classList.remove('is-hovered');
      });
      card.classList.add('is-hovered');
      var accentColor = getCardAccentColor(card);
      if (accentColor && accentColor !== activeHex) {
        applyTheme(accentColor);
      }
    };
  }

  function handleMouseLeave(card) {
    return function () {
      card.classList.remove('is-hovered');
      clearTheme();
    };
  }

  function bindCard(card) {
    if (card.dataset.hoverBound) return;
    card.dataset.hoverBound = 'true';
    var img = card.querySelector('.img-wrap');
    if (!img) return;
    var enterHandler = handleMouseEnter(card);
    var leaveHandler = handleMouseLeave(card);
    img.addEventListener('mouseenter', enterHandler);
    img.addEventListener('mouseleave', leaveHandler);
    boundCards.push({ img: img, enter: enterHandler, leave: leaveHandler, card: card });
  }

  function enable() {
    // Create overlay
    overlay = document.createElement('div');
    overlay.id = 'hover-theme-overlay';
    body.insertBefore(overlay, body.firstChild);

    // Bind existing cards
    gridContainer.querySelectorAll('.masonry-item').forEach(bindCard);

    // Handle cards added by Finsweet after filter
    mutationObserver = new MutationObserver(function () {
      gridContainer.querySelectorAll('.masonry-item').forEach(bindCard);
    });
    mutationObserver.observe(gridContainer, { childList: true });

    requestAnimationFrame(function () {
      body.classList.add('theme-active-ready');
    });
  }

  function disable() {
    // Cancel animation frame
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Clear timers
    clearTimeout(fadeTimer);
    fadeTimer = null;

    // Disconnect observer
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    // Remove event listeners from all bound cards
    boundCards.forEach(function (entry) {
      entry.img.removeEventListener('mouseenter', entry.enter);
      entry.img.removeEventListener('mouseleave', entry.leave);
      delete entry.card.dataset.hoverBound;
    });
    boundCards = [];

    // Clear inline styles and body classes
    clearInlineStyles();
    body.classList.remove('theme-active', 'theme-fading', 'theme-active-ready');
    body.style.removeProperty('--theme-bg');

    // Remove overlay
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }

    // Reset state
    activeHex = null;
    accentRgb = null;
    lastHoveredCard = null;
    themedEls = [];
  }

  // Enable/disable based on breakpoint
  function onBreakpointChange(e) {
    if (e.matches) {
      // Crossed to mobile — disable
      disable();
    } else {
      // Crossed to desktop — enable
      enable();
    }
  }

  mq.addEventListener('change', onBreakpointChange);

  // Initial setup
  if (!mq.matches) {
    enable();
  }
}

initHoverTheme();
