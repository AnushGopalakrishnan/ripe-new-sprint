/**
 * Horizontal Blog Layout
 *
 * Parses CMS rich text, measures with pretext (no DOM reflow),
 * fills columns, and sets up horizontal scroll.
 */
(function () {
  'use strict';

  // ── Config ──
  var MIN_FILL_RATIO = 0.6;    // fill at least 60% before breaking
  var TALL_PARA_RATIO = 0.5;   // paragraphs taller than 50% → top-align
  var PORTRAIT_THRESHOLD = 0.6;
  var RESIZE_DEBOUNCE = 300;
  var RESIZE_TRANSITION_MS = 220;
  var MIXED_PANEL_GAP = '1.75rem';
  var FULL_IMAGE_PANEL_GAP = '12rem';
  var SCROLL_EASING = 0.2;
  var MAX_VERTICAL_WHEEL_SCROLL_DELTA = 180;
  var SCROLL_SNAP_THRESHOLD = 24;
  var HERO_STACK_GAP = '2.375rem';
  var HERO_TITLE_TO_SUMMARY_GAP = '0.5rem';
  var HERO_PANEL_WIDTH = 600;
  var LAYOUT_COL_WIDTH = 360;

  var runtimeConfig = getRuntimeConfig();

  function getRuntimeConfig() {
    var width = window.innerWidth;

    if (width >= 1440) {
      return { colWidth: 360, colGap: '8rem', edgeOffset: '4rem' };
    }

    if (width >= 1024) {
      return { colWidth: 320, colGap: '8rem', edgeOffset: '4rem' };
    }

    if (width >= 768) {
      return { colWidth: 280, colGap: '6rem', edgeOffset: '2rem' };
    }

    return { colWidth: 260, colGap: '3rem', edgeOffset: '1.25rem' };
  }

  function toPixels(lengthValue) {
    if (typeof lengthValue !== 'string') return Number(lengthValue) || 0;
    if (lengthValue.indexOf('rem') !== -1) {
      return parseFloat(lengthValue) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    if (lengthValue.indexOf('px') !== -1) {
      return parseFloat(lengthValue);
    }
    return parseFloat(lengthValue) || 0;
  }

  // ── Grab Webflow elements ──

  var wrap = document.querySelector('[data-horizontal-scroll-wrap]');
  var richTextWrap = document.querySelector('[data-article-richtext-wrap]');
  if (!wrap || !richTextWrap) return;

  function getHeroLeadInset() {
    var wrapPaddingLeft = parseFloat(getComputedStyle(wrap).paddingLeft) || 0;
    return Math.max(
      toPixels(runtimeConfig.edgeOffset),
      toPixels(runtimeConfig.edgeOffset) + toPixels(runtimeConfig.colGap) - wrapPaddingLeft
    ) + 'px';
  }

  function applyHeroPanelSizing() {
    if (!heroPanel) return;

    heroPanel.style.setProperty('width', HERO_PANEL_WIDTH + 'px', 'important');
    heroPanel.style.setProperty('min-width', HERO_PANEL_WIDTH + 'px', 'important');
    heroPanel.style.setProperty('max-width', HERO_PANEL_WIDTH + 'px', 'important');
    heroPanel.style.setProperty('flex-basis', HERO_PANEL_WIDTH + 'px', 'important');
    heroPanel.style.setProperty('flex-grow', '0', 'important');
    heroPanel.style.setProperty('flex-shrink', '0', 'important');
  }

  // ── Inject styles ──
  var style = document.createElement('style');
  style.id = 'hblog-styles';
  function applyRuntimeStyles() {
    var colWidth = runtimeConfig.colWidth;
    var heroLeadInset = getHeroLeadInset();
    var fullImagePanelExtraGap = Math.max(
      0,
      toPixels(FULL_IMAGE_PANEL_GAP) - toPixels(runtimeConfig.colGap)
    ) + 'px';

    style.textContent =
      'html.hblog-overscroll-lock, body.hblog-overscroll-lock { overscroll-behavior-y: none !important; }' +
      '.article__panel .article__panel-inner { max-height: 60vh; }' +

      /* Hero: text-only title card */
      '.article__panel.is-hero { flex: 0 0 ' + HERO_PANEL_WIDTH + 'px !important; min-width: ' + HERO_PANEL_WIDTH + 'px !important; max-width: ' + HERO_PANEL_WIDTH + 'px !important; flex-direction: row !important; justify-content: center !important; align-items: center !important; row-gap: 0 !important; column-gap: 0 !important; width: ' + HERO_PANEL_WIDTH + 'px !important; }' +
      '.article__panel.is-hero .u-flex-horizontal { height: 60vh !important; max-height: 60vh !important; flex-direction: column !important; justify-content: flex-start !important; align-items: stretch !important; gap: 0 !important; padding-left: ' + heroLeadInset + ' !important; box-sizing: border-box !important; }' +
      '.article__hero-image-wrap { display: none !important; }' +
      '.article__hero-content { width: 100% !important; height: 100% !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; gap: 0 !important; }' +
      '.article__hero-content > * { margin-top: 0 !important; margin-bottom: 0 !important; }' +
      '.hero-eyebrow { margin-bottom: ' + HERO_STACK_GAP + ' !important; }' +
      '.article__title { margin-top: 0 !important; margin-bottom: ' + HERO_TITLE_TO_SUMMARY_GAP + ' !important; font-size: 56px !important; line-height: 1.15 !important; }' +
      '.article__summary { margin-top: 0 !important; margin-bottom: ' + HERO_STACK_GAP + ' !important; }' +
      '.article__meta-wrap { margin-top: 0 !important; margin-bottom: 0 !important; width: auto !important; }' +
      '.hero-meta-row { display: flex !important; align-items: center !important; justify-content: flex-start !important; width: auto !important; gap: 0.75rem !important; }' +
      '.hero-meta-text { width: auto !important; display: block !important; flex: 0 0 auto !important; align-self: auto !important; }' +
      '.hero-meta-divider { flex: 0 0 3rem !important; width: 3rem !important; min-width: 3rem !important; height: 1px !important; display: block !important; background: currentColor !important; opacity: 0.22 !important; }' +
      '.hero-details { display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; min-height: 0 !important; }' +
      '.hero-author { margin-top: auto !important; }' +
      '.hero-author-image { background-size: contain !important; background-position: center center !important; background-repeat: no-repeat !important; }' +

      /* Text panels */
      '.article__panel.is-text { width: ' + colWidth + 'px !important; }' +
      '.article__panel.is-heading { width: ' + colWidth + 'px !important; }' +
      '.article__panel.is-image { width: auto !important; }' +
      '.article__panel.is-quote { width: ' + colWidth + 'px !important; }' +

      /* Vertical alignment by data attribute */
      '.article__panel[data-valign="top"] .article__panel-inner { justify-content: flex-start !important; }' +
      '.article__panel[data-valign="bottom"] .article__panel-inner { justify-content: flex-end !important; }' +
      '.article__panel[data-valign="spread"] { justify-content: center !important; align-items: stretch !important; }' +
      '.article__panel[data-valign="spread"] .article__panel-inner { justify-content: flex-start !important; align-items: stretch !important; gap: ' + MIXED_PANEL_GAP + ' !important; height: 60vh !important; max-height: none !important; flex-shrink: 0 !important; }' +
      '.article__panel-media { flex: 1 1 0 !important; min-height: 0 !important; display: flex !important; flex-direction: column !important; gap: ' + MIXED_PANEL_GAP + ' !important; }' +
      '.article__panel-media-item { flex: 1 1 0 !important; min-height: 0 !important; overflow: hidden !important; }' +
      '.article__panel-media-item img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }' +

      /* Standalone images: fill 60vh content band, width from aspect ratio */
      '.article__panel.has-wide-image-gap { margin-left: ' + fullImagePanelExtraGap + ' !important; margin-right: ' + fullImagePanelExtraGap + ' !important; }' +
      '.article__panel.is-image { justify-content: center !important; align-items: center !important; }' +
      '.article__panel.is-image .article__panel-inner { height: 60vh !important; max-height: 60vh !important; display: flex !important; }' +
      '.article__panel.is-image .article__image-wrap { height: 100% !important; overflow: hidden !important; border-radius: 0 !important; }' +
      '.article__panel.is-image .article__image { height: 100% !important; width: auto !important; display: block !important; object-fit: cover !important; max-height: none !important; border-radius: 0 !important; position: static !important; }' +
      '.article__panel.is-image .article__caption { display: none; }' +

      /* Quotes: centered */
      '.article__panel.is-quote .article__panel-inner { justify-content: center !important; align-items: center; }' +

      /* Typography */
      '.article__text-content { font-size: 0.9375rem !important; line-height: 1.65 !important; font-family: "Plantin MT Pro", "Plantin", Georgia, serif !important; }' +
      '.article__text-content p { margin-bottom: 1.25rem; }' +
      '.article__text-content h2 { font-size: 1.375rem; font-weight: 500; margin-top: 0; margin-bottom: 0.75rem; line-height: 1.3; }' +
      '.article__text-content h3 { font-size: 1.125rem !important; font-weight: 500; margin-top: 0 !important; margin-bottom: 0.625rem !important; line-height: 1.35; }' +
      '.article__section-title { font-size: 1.5rem !important; line-height: 1.25 !important; margin-bottom: 0.75rem !important; }';
  }
  applyRuntimeStyles();
  document.head.appendChild(style);

  var richText = richTextWrap.querySelector('.w-richtext');
  if (!richText || richText.children.length === 0) return;

  // ── Cache templates ──

  var templates = {};
  ['hero', 'heading', 'text', 'image', 'quote'].forEach(function (type) {
    var el = wrap.querySelector('[data-template="' + type + '"]');
    if (el) {
      templates[type] = el.cloneNode(true);
      if (type !== 'hero') el.remove();
    }
  });

  var heroPanel = wrap.querySelector('[data-template="hero"]');
  if (heroPanel) heroPanel.removeAttribute('data-template');

  wrap.querySelectorAll('[data-template]').forEach(function (el) { el.remove(); });

  // ── Helpers ──

  function getColumnHeight() {
    return window.innerHeight * 0.6;
  }

  function getMeasurementColumnWidth() {
    return LAYOUT_COL_WIDTH;
  }

  function countReadableWords(root) {
    if (!root) return 0;

    var clone = root.cloneNode(true);
    clone.querySelectorAll('script, style, noscript').forEach(function (node) {
      node.remove();
    });

    var text = (clone.textContent || '')
      .replace(/[\u200B\u00AD\uFEFF\u200D]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) return 0;
    return text.split(' ').filter(Boolean).length;
  }

  function formatReadTime(wordCount) {
    var minutes = Math.max(1, Math.round(wordCount / 200));
    return minutes + ' Min Read';
  }

  function updateHeroReadTime(text) {
    if (!heroPanel || !text) return;

    var readTimeEl = null;
    var metaTextEls = heroPanel.querySelectorAll('.hero-meta-text');

    Array.prototype.some.call(metaTextEls, function (el) {
      if (/min\s+read/i.test(el.textContent || '')) {
        readTimeEl = el;
        return true;
      }
      return false;
    });

    if (!readTimeEl && metaTextEls.length > 1) {
      readTimeEl = metaTextEls[1];
    }

    if (readTimeEl) {
      readTimeEl.textContent = text;
    }
  }

  // ── Block parsing ──

  function parseBlocks() {
    var children = richText.children;
    var blocks = [];
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var tag = el.tagName.toLowerCase();

      if (tag === 'p' && el.textContent.trim().replace(/\u200B|\u00AD|\uFEFF/g, '').length === 0) continue;
      if (tag === 'h1') continue;

      var type = 'text';
      if (tag === 'h2' || tag === 'h3') type = 'heading';
      else if (tag === 'blockquote') type = 'quote';
      else if (tag === 'figure' || tag === 'img') type = 'image';
      else if (tag === 'p' && el.children.length === 1 && el.children[0].tagName === 'IMG') type = 'image';

      blocks.push({ el: el, type: type, tag: tag, text: el.textContent || '' });
    }
    return blocks;
  }

  // ── Image pre-loading ──
  // Images in the hidden CMS wrapper have loading="lazy" and never load.
  // Pre-load them to get natural dimensions.

  function preloadImages(blocks) {
    var promises = [];
    blocks.forEach(function (block) {
      if (block.type !== 'image') return;
      var img = block.el.tagName === 'IMG' ? block.el : block.el.querySelector('img');
      if (!img || !img.src) return;

      var p = new Promise(function (resolve) {
        // Check if already loaded
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          block.imgWidth = img.naturalWidth;
          block.imgHeight = img.naturalHeight;
          resolve();
          return;
        }
        // Create a new Image to force load
        var loader = new Image();
        loader.onload = function () {
          block.imgWidth = loader.naturalWidth;
          block.imgHeight = loader.naturalHeight;
          resolve();
        };
        loader.onerror = function () {
          block.imgWidth = 0;
          block.imgHeight = 0;
          resolve();
        };
        loader.src = img.src;
      });
      promises.push(p);
    });

    return promises.length > 0
      ? Promise.race([Promise.all(promises), new Promise(function (r) { setTimeout(r, 2000); })])
      : Promise.resolve();
  }

  // ── Image classification (after preload) ──

  function classifyImage(block, colH) {
    if (!block.imgWidth || !block.imgHeight) {
      block.imageClass = 'landscape';
      block.scaledImageH = 200;
      return;
    }
    var ratio = block.imgHeight / block.imgWidth;
    var scaledH = getMeasurementColumnWidth() * ratio;
    block.scaledImageH = scaledH;
    block.imageClass = (scaledH >= colH * PORTRAIT_THRESHOLD) ? 'portrait' : 'landscape';
  }

  // ── Measurement with pretext ──

  function measureWithPretext(pretextMod, blocks, colH) {
    var prepare = pretextMod.prepare;
    var layout = pretextMod.layout;
    var measurementColWidth = getMeasurementColumnWidth();

    // Compute font strings from our known CSS values
    var bodyFont = '0.9375rem "system-ui", -apple-system, sans-serif';
    var headingFont = '500 1.375rem "system-ui", -apple-system, sans-serif';
    var h3Font = '500 1.125rem "system-ui", -apple-system, sans-serif';

    // Convert rem to px (assume 16px root)
    var bodyPx = 15;
    var bodyLH = 15 * 1.65; // ~24.75px
    var headingPx = 22;
    var headingLH = 22 * 1.3;
    var h3Px = 18;
    var h3LH = 18 * 1.35;

    // Build pixel-based font strings for canvas measurement
    var bodyFontPx = bodyPx + 'px system-ui, -apple-system, sans-serif';
    var headingFontPx = '500 ' + headingPx + 'px system-ui, -apple-system, sans-serif';
    var h3FontPx = '500 ' + h3Px + 'px system-ui, -apple-system, sans-serif';

    blocks.forEach(function (block) {
      if (block.type === 'image') {
        classifyImage(block, colH);
        block.height = block.scaledImageH;
        return;
      }

      if (block.type === 'quote') {
        // Approximate quote height
        var qPrep = prepare(block.text, headingFontPx);
        var qLayout = layout(qPrep, measurementColWidth, headingLH);
        block.height = qLayout.height + 32; // padding
        return;
      }

      var font, lh, marginBottom;
      if (block.type === 'heading') {
        if (block.tag === 'h3') {
          font = h3FontPx;
          lh = h3LH;
          marginBottom = 10;
        } else {
          font = headingFontPx;
          lh = headingLH;
          marginBottom = 12;
        }
      } else {
        font = bodyFontPx;
        lh = bodyLH;
        marginBottom = 20; // 1.25rem
      }

      var prepared = prepare(block.text, font);
      var result = layout(prepared, measurementColWidth, lh);
      block.height = result.height + marginBottom;
    });
  }

  // ── Fallback DOM measurement ──

  function measureWithDOM(blocks, colH) {
    var measurer = document.createElement('div');
    measurer.style.cssText = 'position:absolute;top:-9999px;left:-9999px;visibility:hidden;width:' + getMeasurementColumnWidth() + 'px;overflow:hidden;';
    document.body.appendChild(measurer);

    blocks.forEach(function (block) {
      if (block.type === 'image') {
        classifyImage(block, colH);
        block.height = block.scaledImageH;
        return;
      }
      var clone = block.el.cloneNode(true);
      measurer.innerHTML = '';
      measurer.appendChild(clone);
      block.height = clone.offsetHeight;
    });

    document.body.removeChild(measurer);
  }

  // ── Column filling ──

  function fillColumns(blocks, colH) {
    var columns = [];
    var currentItems = [];
    var currentH = 0;

    function flushColumn() {
      if (currentItems.length > 0) {
        columns.push({ type: 'text', items: currentItems, fillHeight: currentH });
        currentItems = [];
        currentH = 0;
      }
    }

    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];

      // Quotes get their own column
      if (block.type === 'quote') {
        flushColumn();
        columns.push({ type: 'quote', items: [block], fillHeight: block.height });
        continue;
      }

      // Large images (>60% column height) get their own column
      if (block.type === 'image' && block.height > colH * 0.6) {
        flushColumn();
        columns.push({ type: 'image', items: [block], fillHeight: block.height });
        continue;
      }

      // Would this block overflow?
      if (currentH + block.height > colH && currentItems.length > 0) {
        // Only break if we've filled at least 60%
        if (currentH >= colH * MIN_FILL_RATIO) {
          // Don't orphan a trailing heading
          var lastItem = currentItems[currentItems.length - 1];
          if (lastItem && lastItem.type === 'heading') {
            var orphan = currentItems.pop();
            currentH -= orphan.height;
            flushColumn();
            currentItems.push(orphan);
            currentH += orphan.height;
          } else {
            flushColumn();
          }
        }
        // If under 60%, keep packing (allow overflow to fill the column more)
      }

      currentItems.push(block);
      currentH += block.height;
    }

    flushColumn();
    return columns;
  }

  // ── Panel construction ──

  function buildPanel(column) {
    var hasHeading = column.items.some(function (b) { return b.type === 'heading'; });
    var hasNonHeading = column.items.some(function (b) { return b.type !== 'heading'; });

    var template;
    if (column.type === 'quote') template = templates.quote;
    else if (column.type === 'image') template = templates.image;
    else if (hasHeading && !hasNonHeading) template = templates.heading;
    else template = templates.text;
    if (!template) template = templates.text;
    if (!template) return null;

    var panel = template.cloneNode(true);
    panel.removeAttribute('data-template');

    var slot = panel.querySelector('[data-content-slot]') ||
               panel.querySelector('.article__text-content') ||
               panel.querySelector('.article__panel-inner') ||
               panel;

    if (column.type === 'quote') {
      var quoteEl = panel.querySelector('.article__blockquote');
      if (quoteEl && column.items[0]) quoteEl.textContent = column.items[0].el.textContent;
      var attrEl = panel.querySelector('.article__quote-attribution');
      if (attrEl) attrEl.remove();
    } else if (column.type === 'image') {
      panel.classList.add('has-wide-image-gap');

      var imgEl = panel.querySelector('.article__image');
      var captionEl = panel.querySelector('.article__caption');
      var srcImg = column.items[0].el.querySelector('img') ||
                   (column.items[0].el.tagName === 'IMG' ? column.items[0].el : null);
      if (imgEl && srcImg) {
        imgEl.src = srcImg.src;
        imgEl.alt = srcImg.alt || '';
        imgEl.removeAttribute('srcset');
      }
      var figcaption = column.items[0].el.querySelector('figcaption');
      if (captionEl && figcaption) captionEl.textContent = figcaption.textContent;
      else if (captionEl) captionEl.remove();
    } else {
      // Check if mixed (text + images in same column)
      var hasImg = column.items.some(function (b) { return b.type === 'image'; });
      var hasNonImg = column.items.some(function (b) { return b.type !== 'image'; });

      if (hasImg && hasNonImg) {
        // Mixed column: text stays natural height, images fill the remaining column height.
        var panelInner = panel.querySelector('.article__panel-inner');
        if (panelInner) {
          panelInner.innerHTML = '';

          var textGroup = document.createElement('div');
          textGroup.className = 'article__text-content';
          textGroup.style.flex = '0 0 auto';

          var mediaGroup = document.createElement('div');
          mediaGroup.className = 'article__panel-media';

          column.items.forEach(function (block) {
            var clone = block.el.cloneNode(true);
            clone.innerHTML = clone.innerHTML
              .replace(/[\u200B\u00AD\uFEFF\u200D]+/g, '')
              .replace(/\s{2,}/g, ' ')
              .replace(/(<br\s*\/?>){2,}/gi, '<br>');
            if (clone.textContent.trim().length === 0 && !clone.querySelector('img')) return;

            if (block.type === 'image') {
              var img = clone.querySelector('img') || (clone.tagName === 'IMG' ? clone : null);
              if (img) {
                var mediaItem = document.createElement('div');
                mediaItem.className = 'article__panel-media-item';
                mediaItem.appendChild(img);
                mediaGroup.appendChild(mediaItem);
              }
            } else {
              textGroup.appendChild(clone);
            }
          });

          panelInner.appendChild(textGroup);
          if (mediaGroup.children.length > 0) {
            panelInner.appendChild(mediaGroup);
          }
        }
      } else {
        // Pure text column
        slot.innerHTML = '';
        column.items.forEach(function (block) {
          var clone = block.el.cloneNode(true);
          clone.innerHTML = clone.innerHTML
            .replace(/[\u200B\u00AD\uFEFF\u200D]+/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/(<br\s*\/?>){2,}/gi, '<br>');
          if (clone.textContent.trim().length === 0 && !clone.querySelector('img')) return;
          slot.appendChild(clone);
        });
      }
    }

    return panel;
  }

  // ── Scroll handling ──

  var scrollState = {
    currentX: 0,
    targetX: 0,
    rafId: null
  };
  var touchState = {
    startY: 0,
    startX: 0,
    targetAtStart: 0
  };
  var scrollListenersBound = false;

  function getMaxScroll() {
    return trackEl ? Math.max(0, trackEl.scrollWidth - wrap.clientWidth) : 0;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updateOverscrollLock() {
    var shouldLock = false;

    if (trackEl) {
      var pageY = window.scrollY || window.pageYOffset || 0;
      shouldLock = pageY <= 1 && scrollState.targetX > 0.5;
    }

    document.documentElement.classList.toggle('hblog-overscroll-lock', shouldLock);
    document.body.classList.toggle('hblog-overscroll-lock', shouldLock);
  }

  function applyScroll() {
    if (!trackEl) {
      scrollState.rafId = null;
      updateOverscrollLock();
      return;
    }

    var diff = scrollState.targetX - scrollState.currentX;
    if (Math.abs(diff) < 0.5) {
      scrollState.currentX = scrollState.targetX;
      scrollState.rafId = null;
    } else if (Math.abs(diff) <= SCROLL_SNAP_THRESHOLD) {
      scrollState.currentX = scrollState.targetX;
      scrollState.rafId = null;
    } else {
      scrollState.currentX += diff * SCROLL_EASING;
      scrollState.rafId = requestAnimationFrame(applyScroll);
    }

    trackEl.style.transform = 'translate3d(' + (-scrollState.currentX) + 'px, 0, 0)';
    updateOverscrollLock();
  }

  function scrollBy(delta) {
    if (!trackEl) return;

    scrollState.targetX = clamp(scrollState.targetX + delta, 0, getMaxScroll());
    updateOverscrollLock();
    if (!scrollState.rafId) scrollState.rafId = requestAnimationFrame(applyScroll);
  }

  function canAdvanceHorizontally(delta) {
    var maxScroll = getMaxScroll();
    if (!trackEl || maxScroll <= 0 || !isHorizontalSectionActive()) return false;

    if (delta > 0) return scrollState.targetX < maxScroll - 0.5;
    if (delta < 0) return scrollState.targetX > 0.5;
    return false;
  }

  function isHorizontalSectionActive() {
    if (!wrap) return false;

    var rect = wrap.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    return Math.abs(rect.top) <= 1 && Math.abs(rect.bottom - viewportHeight) <= 1;
  }

  function shouldHandoffToVertical(delta) {
    var maxScroll = getMaxScroll();
    if (!trackEl || maxScroll <= 0 || !isHorizontalSectionActive()) return false;

    if (delta > 0) return scrollState.targetX >= maxScroll - 0.5;
    if (delta < 0) return scrollState.targetX <= 0.5;
    return false;
  }

  function getWheelHorizontalDelta(delta, isHorizontalGesture) {
    if (isHorizontalGesture) return delta;
    return clamp(delta, -MAX_VERTICAL_WHEEL_SCROLL_DELTA, MAX_VERTICAL_WHEEL_SCROLL_DELTA);
  }

  function getVerticalToHorizontalTransition(delta) {
    if (!trackEl || isHorizontalSectionActive() || delta === 0) return null;

    var rect = wrap.getBoundingClientRect();
    var maxScroll = getMaxScroll();

    if (delta < 0 && scrollState.targetX > 0.5 && rect.top < 0 && delta < rect.top) {
      return {
        verticalDelta: rect.top,
        horizontalDelta: getWheelHorizontalDelta(delta - rect.top, false)
      };
    }

    if (delta > 0 && scrollState.targetX < maxScroll - 0.5 && rect.top > 0 && delta > rect.top) {
      return {
        verticalDelta: rect.top,
        horizontalDelta: getWheelHorizontalDelta(delta - rect.top, false)
      };
    }

    return null;
  }

  function settleToBoundary(delta, immediate) {
    if (!trackEl) return;

    var maxScroll = getMaxScroll();
    scrollState.targetX = delta > 0 ? maxScroll : 0;

    if (scrollState.rafId) {
      cancelAnimationFrame(scrollState.rafId);
      scrollState.rafId = null;
    }

    if (immediate) {
      scrollState.currentX = scrollState.targetX;
      trackEl.style.transform = 'translate3d(' + (-scrollState.currentX) + 'px, 0, 0)';
      updateOverscrollLock();
      return;
    }

    updateOverscrollLock();
    if (!scrollState.rafId) {
      scrollState.rafId = requestAnimationFrame(applyScroll);
    }
  }

  function handleTouchStart(e) {
    if (!trackEl) return;
    touchState.startY = e.touches[0].clientY;
    touchState.startX = e.touches[0].clientX;
    touchState.targetAtStart = scrollState.targetX;
    scrollState.currentX = scrollState.targetX;
  }

  function handleTouchMove(e) {
    if (!trackEl) return;

    var deltaY = touchState.startY - e.touches[0].clientY;
    var deltaX = touchState.startX - e.touches[0].clientX;
    var delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;

    if (!canAdvanceHorizontally(delta)) return;

    scrollState.targetX = clamp(touchState.targetAtStart + delta, 0, getMaxScroll());
    scrollState.currentX = scrollState.targetX;
    trackEl.style.transform = 'translate3d(' + (-scrollState.currentX) + 'px, 0, 0)';
    e.preventDefault();
  }

  function isTypingTarget(target) {
    if (!target || !target.tagName) return false;

    var tagName = target.tagName.toLowerCase();
    return tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable;
  }

  function getKeyboardDelta(e) {
    if (!e) return 0;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
        return 120;
      case ' ':
        return e.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        return -120;
      default:
        return 0;
    }
  }

  function handleKeydown(e) {
    if (!trackEl || isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

    var delta = getKeyboardDelta(e);
    if (!delta) return;

    if (canAdvanceHorizontally(delta)) {
      e.preventDefault();
      scrollBy(delta);
      return;
    }

    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && shouldHandoffToVertical(delta)) {
      e.preventDefault();
      settleToBoundary(delta, true);
      window.scrollBy(0, delta);
    }
  }

  function handleWheel(e) {
    if (!trackEl) return;

    var isHorizontalGesture = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    var rawDelta = isHorizontalGesture ? e.deltaX : e.deltaY;
    var horizontalDelta = getWheelHorizontalDelta(rawDelta, isHorizontalGesture);
    var transition = getVerticalToHorizontalTransition(rawDelta);

    if (!isHorizontalGesture && transition) {
      e.preventDefault();
      window.scrollBy(0, transition.verticalDelta);
      scrollBy(transition.horizontalDelta);
      return;
    }

    if (canAdvanceHorizontally(rawDelta)) {
      e.preventDefault();
      scrollBy(horizontalDelta);
      return;
    }

    if (shouldHandoffToVertical(rawDelta)) {
      settleToBoundary(rawDelta, isHorizontalGesture);

      if (isHorizontalGesture) {
        e.preventDefault();
        window.scrollBy(0, rawDelta);
      }
    }
  }

  function setupScroll() {
    var track = document.createElement('div');
    track.style.cssText =
      'display:flex;flex-direction:row;height:100%;will-change:transform;flex-shrink:0;' +
      'gap:' + runtimeConfig.colGap + ';';

    while (wrap.firstChild) track.appendChild(wrap.firstChild);

    var endSpacer = document.createElement('div');
    endSpacer.setAttribute('aria-hidden', 'true');
    endSpacer.style.cssText =
      'flex:0 0 ' + runtimeConfig.edgeOffset + ';' +
      'width:' + runtimeConfig.edgeOffset + ';' +
      'height:1px;pointer-events:none;';
    track.appendChild(endSpacer);

    wrap.appendChild(track);
    trackEl = track;

    if (!scrollListenersBound) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('scroll', updateOverscrollLock, { passive: true });
      wrap.addEventListener('touchstart', handleTouchStart, { passive: true });
      wrap.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('keydown', handleKeydown);
      scrollListenersBound = true;
    }
  }

  // ── Resize ──

  var resizeTimer;
  var generatedPanels = [];
  var trackEl = null; // set by setupScroll
  var cachedPretextMod = null;
  
  function getScrollSnapshot() {
    var maxScroll = getMaxScroll();
    if (!trackEl || maxScroll <= 0) {
      return {
        currentX: scrollState.currentX,
        targetX: scrollState.targetX,
        currentRatio: 0,
        targetRatio: 0
      };
    }

    return {
      currentX: scrollState.currentX,
      targetX: scrollState.targetX,
      currentRatio: scrollState.currentX / maxScroll,
      targetRatio: scrollState.targetX / maxScroll
    };
  }

  function resetScrollPosition() {
    if (scrollState.rafId) {
      cancelAnimationFrame(scrollState.rafId);
      scrollState.rafId = null;
    }
    scrollState.currentX = 0;
    scrollState.targetX = 0;
    if (trackEl) {
      trackEl.style.transform = 'translate3d(0px, 0, 0)';
    }
    updateOverscrollLock();
  }

  function teardown(preserveScroll) {
    if (scrollState.rafId) {
      cancelAnimationFrame(scrollState.rafId);
      scrollState.rafId = null;
    }

    if (!preserveScroll) {
      scrollState.currentX = 0;
      scrollState.targetX = 0;
    }

    generatedPanels.forEach(function (p) { p.remove(); });
    generatedPanels = [];

    if (trackEl) {
      if (heroPanel && trackEl.contains(heroPanel)) {
        wrap.appendChild(heroPanel);
      }
      trackEl.remove();
      trackEl = null;
    }
    updateOverscrollLock();
  }
  
  function restoreScrollPosition(snapshot) {
    if (!trackEl || !snapshot) {
      resetScrollPosition();
      return;
    }

    var maxScroll = getMaxScroll();
    if (maxScroll <= 0) {
      resetScrollPosition();
      return;
    }

    var nextCurrentX = clamp(snapshot.currentX, 0, maxScroll);
    var nextTargetX = clamp(snapshot.targetX, 0, maxScroll);

    scrollState.currentX = nextCurrentX;
    scrollState.targetX = nextTargetX;
    trackEl.style.transition = '';
    trackEl.style.transform = 'translate3d(' + (-scrollState.currentX) + 'px, 0, 0)';
    updateOverscrollLock();

    if (Math.abs(scrollState.targetX - scrollState.currentX) >= 0.5 && !scrollState.rafId) {
      scrollState.rafId = requestAnimationFrame(applyScroll);
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var scrollSnapshot = getScrollSnapshot();
      teardown(true);
      runLayout(cachedPretextMod, allBlocks);
      setupScroll();
      restoreScrollPosition(scrollSnapshot);
    }, RESIZE_DEBOUNCE);
  }

  // ── Main layout ──

  function runLayout(pretextMod, preBlocks) {
    runtimeConfig = getRuntimeConfig();
    applyRuntimeStyles();
    applyHeroPanelSizing();

    var colH = getColumnHeight();
    var blocks = preBlocks || parseBlocks();

    // Measure
    if (pretextMod) {
      measureWithPretext(pretextMod, blocks, colH);
    } else {
      measureWithDOM(blocks, colH);
    }

    // Fill columns
    var columns = fillColumns(blocks, colH);

    // Build panels — insert into track if it exists, otherwise wrap
    var container = trackEl || wrap;
    var insertAfter = heroPanel || container.firstElementChild;
    var refNode = insertAfter ? insertAfter.nextSibling : null;

    columns.forEach(function (col) {
      var panel = buildPanel(col);
      if (!panel) return;

      // Vertical alignment
      var hasImage = col.items.some(function (b) { return b.type === 'image'; });
      var hasText = col.items.some(function (b) { return b.type !== 'image'; });

      if (hasImage && hasText) {
        // Mixed column: text top, image bottom with space between
        panel.setAttribute('data-valign', 'spread');
      } else if (col.type === 'text') {
        var valign = (col.fillHeight > colH * TALL_PARA_RATIO) ? 'top' : 'bottom';
        panel.setAttribute('data-valign', valign);
      } else if (col.type === 'image') {
        panel.setAttribute('data-valign', 'top');
      }

      container.insertBefore(panel, refNode);
      generatedPanels.push(panel);
    });

    wrap.style.opacity = '1';
  }

  // ── Init: preload images + load pretext, then layout ──

  var allBlocks = parseBlocks();
  updateHeroReadTime(formatReadTime(countReadableWords(richText)));

  Promise.all([
    preloadImages(allBlocks),
    import('https://esm.sh/@chenglou/pretext').catch(function () { return null; })
  ]).then(function (results) {
    cachedPretextMod = results[1];
    if (!cachedPretextMod) console.warn('[HBlog] pretext failed to load, using DOM measurement');
    runLayout(cachedPretextMod, allBlocks);
    setupScroll();
    window.addEventListener('resize', handleResize);
  });
})();
