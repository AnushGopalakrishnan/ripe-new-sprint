(function () {
  'use strict';

  var INIT_KEY = '__ripeWritingNewCopyFeedInit';
  var MOBILE_BREAKPOINT = 767;
  var RESIZE_DEBOUNCE = 200;
  var IMAGE_REFRESH_DELAY = 100;
  var HOVER_MEDIA_QUERY = '(hover: hover) and (min-width: 768px)';
  var HOVER_CLEAR_DELAY = 60;
  var FILTER_RENDER_DEBOUNCE = 220;
  var FILTER_ACTIVE_CLASS = 'writing-feed-filter-active';
  var FILTER_EXIT_DURATION = 180;
  var FILTER_ENTRY_DURATION = 500;
  var FILTER_ENTRY_STAGGER = 30;
  var MOBILE_FILTER_CLOSE_DELAY = 300;
  var MOBILE_ENTRY_HOLD_MIN = 72;
  var MOBILE_ENTRY_HOLD_MAX = 120;
  var MOBILE_EXIT_HOLD_MIN = 96;
  var MOBILE_EXIT_HOLD_MAX = 160;
  var SCROLL_EASING = 0.2;
  var MAX_VERTICAL_WHEEL_SCROLL_DELTA = 180;
  var SCROLL_SNAP_THRESHOLD = 24;
  var TEMP_TAGS_BY_SLUG = {
    'developing-your-writing-voice': 'Process',
    'the-art-of-storytelling': 'Story',
    'the-power-of-words': 'Language',
    'the-role-of-research-in-writing': 'Research',
    'understanding-writing-techniques': 'Craft',
    'writing-for-different-audiences': 'Audience'
  };
  var FALLBACK_TAGS = {
    'Understanding Writing Techniques': 'Craft',
    'Writing for Different Audiences': 'Audience',
    'The Power of Words': 'Language',
    'The Role of Research in Writing': 'Research',
    'The Art of Storytelling': 'Story',
    'Developing Your Writing Voice': 'Process'
  };

  var state = {
    cachedItems: null,
    currentMaxCards: null,
    largeTemplate: null,
    smallTemplate: null,
    wrap: null,
    hero: null,
    pinShell: null,
    pinSection: null,
    resizeTimer: null,
    trackEl: null,
    scrollTween: null,
    hoverMediaQuery: null,
    hoverClearTimer: null,
    hoveredCard: null,
    hoverEnabled: false,
    hasRegisteredGsapPlugin: false,
    sourceList: null,
    filterForm: null,
    filterResetButton: null,
    filterInputs: [],
    filterObserver: null,
    filterRenderTimer: null,
    filterTransitionTimer: null,
    mobileFilterMediaQuery: null,
    mobileFilterButton: null,
    mobileFilterButtonLabel: null,
    mobileFilterCloseButton: null,
    mobileFilterCloseTimer: null,
    mobileFilterOverlay: null,
    mobileFilterShellMarker: null,
    isResettingFilters: false
  };

  function getMaxSmallCards() {
    return 3;
  }

  function hasGsapSupport() {
    return !!(
      window.gsap &&
      window.ScrollTrigger &&
      typeof window.gsap.to === 'function'
    );
  }

  function registerGsapPlugin() {
    if (!hasGsapSupport() || state.hasRegisteredGsapPlugin) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    state.hasRegisteredGsapPlugin = true;
  }

  function clearPanelTransforms() {
    if (!state.wrap) return;

    if (state.trackEl) {
      state.trackEl.style.removeProperty('transform');
      state.trackEl.style.removeProperty('width');
    }

    if (state.pinSection) {
      state.pinSection.style.removeProperty('transform');
    }

    if (state.pinShell) {
      state.pinShell.classList.remove('is-pinned');
    }

    var panels = state.wrap.querySelectorAll('[data-horizontal-scroll-panel]');
    Array.prototype.forEach.call(panels, function (panel) {
      panel.style.removeProperty('transform');
    });
  }

  function teardownScroll() {
    if (state.hoverClearTimer) {
      clearTimeout(state.hoverClearTimer);
      state.hoverClearTimer = null;
    }

    if (state.scrollTween) {
      if (state.scrollTween.scrollTrigger) {
        state.scrollTween.scrollTrigger.kill();
      }
      state.scrollTween.kill();
      state.scrollTween = null;
    }

    clearPanelTransforms();

    if (state.trackEl) {
      while (state.trackEl.firstChild) {
        state.wrap.appendChild(state.trackEl.firstChild);
      }
      state.trackEl.remove();
      state.trackEl = null;
    }
  }

  function refreshScroll() {
    if (!state.wrap) return;
    initScrolling();
  }

  function clearHoverState() {
    if (state.hoverClearTimer) {
      clearTimeout(state.hoverClearTimer);
      state.hoverClearTimer = null;
    }

    if (state.hoveredCard) {
      state.hoveredCard.classList.remove('is-hovered');
      state.hoveredCard = null;
    }

    if (state.wrap) {
      state.wrap.classList.remove('writing-feed-hover-active');
    }
  }

  function scheduleHoverClear() {
    if (!state.hoverEnabled) {
      clearHoverState();
      return;
    }

    if (state.hoverClearTimer) {
      clearTimeout(state.hoverClearTimer);
    }

    state.hoverClearTimer = setTimeout(function () {
      clearHoverState();
    }, HOVER_CLEAR_DELAY);
  }

  function setHoveredCard(card) {
    if (!state.hoverEnabled || !state.wrap) return;
    if (!card || !state.wrap.contains(card)) {
      clearHoverState();
      return;
    }

    if (state.hoveredCard === card) return;

    if (state.hoverClearTimer) {
      clearTimeout(state.hoverClearTimer);
      state.hoverClearTimer = null;
    }

    if (state.hoveredCard) {
      state.hoveredCard.classList.remove('is-hovered');
    }

    state.hoveredCard = card;
    state.hoveredCard.classList.add('is-hovered');
    state.wrap.classList.add('writing-feed-hover-active');
  }

  function getHoverCard(target) {
    if (!state.wrap || !target || !target.closest) return null;

    var card = target.closest('.demo-card');
    if (!card || !state.wrap.contains(card)) return null;

    return card;
  }

  function updateHoverMode() {
    state.hoverEnabled = !!(
      state.wrap &&
      state.hoverMediaQuery &&
      state.hoverMediaQuery.matches &&
      isDesktopRail()
    );

    if (!state.hoverEnabled) {
      clearHoverState();
    }
  }

  function handleCardMouseOver(event) {
    if (!state.hoverEnabled) return;

    var card = getHoverCard(event.target);
    if (!card) return;

    var fromCard = getHoverCard(event.relatedTarget);
    if (fromCard === card) return;

    setHoveredCard(card);
  }

  function handleCardMouseOut(event) {
    if (!state.hoverEnabled) return;

    var card = getHoverCard(event.target);
    if (!card) return;

    var toCard = getHoverCard(event.relatedTarget);
    if (toCard === card) return;

    if (toCard) {
      setHoveredCard(toCard);
      return;
    }

    scheduleHoverClear();
  }

  function handleWrapMouseLeave() {
    scheduleHoverClear();
  }

  function getSlugFromHref(href) {
    if (!href) return '';

    var slug = String(href).trim();
    if (!slug) return '';

    if (slug.indexOf('://') !== -1) {
      try {
        slug = new URL(slug).pathname;
      } catch (error) {
        return '';
      }
    }

    slug = slug.replace(/\/+$/, '');
    var segments = slug.split('/');
    return segments[segments.length - 1] || '';
  }

  function getTemporaryTag(item) {
    if (!item) return '';

    var explicitTag = item.querySelector('[data-field="tag"], [data-field="breadcrumb-tag"], [fs-list-field]');
    var explicitValue = normalizeTag(explicitTag ? explicitTag.textContent : '');
    if (explicitValue) return explicitValue;

    var slug = item.querySelector('[data-field="slug"]');
    var slugKey = getSlugFromHref(slug ? slug.getAttribute('href') || slug.href : '');
    if (slugKey && TEMP_TAGS_BY_SLUG[slugKey]) {
      return TEMP_TAGS_BY_SLUG[slugKey];
    }

    var title = item.querySelector('[data-field="title"]');
    var titleText = title ? title.textContent.trim() : '';
    return FALLBACK_TAGS[titleText] || '';
  }

  function populateTemporaryFilterTags() {
    if (!state.sourceList) return;

    Array.prototype.forEach.call(state.sourceList.querySelectorAll('.w-dyn-item'), function (item) {
      var tagField = item.querySelector('[fs-list-field="tag"]');
      if (!tagField) return;

      var tag = getTemporaryTag(item);
      tagField.textContent = tag;
      tagField.classList.toggle('w-dyn-bind-empty', !tag);
    });
  }

  function isSourceItemVisible(item) {
    if (!item) return false;

    var styles = window.getComputedStyle(item);
    return styles.display !== 'none' && styles.visibility !== 'hidden' && !item.hidden;
  }

  function getVisibleItems() {
    if (!state.sourceList) return [];

    return Array.prototype.filter.call(
      state.sourceList.querySelectorAll('.w-dyn-item'),
      isSourceItemVisible
    ).map(function (item) {
      var image = item.querySelector('[data-field="image"]');
      var title = item.querySelector('[data-field="title"]');
      var summary = item.querySelector('[data-field="summary"]');
      var slug = item.querySelector('[data-field="slug"]');
      var titleText = title ? title.textContent.trim() : '';

      return {
        image: image ? image.src : '',
        imageAlt: image && image.alt ? image.alt : titleText,
        title: titleText,
        summary: summary ? summary.textContent.trim() : '',
        link: slug ? slug.href : '',
        tag: getTemporaryTag(item)
      };
    });
  }

  function updateResetButtonState() {
    if (!state.filterResetButton) return;

    var hasActiveFilters = state.filterInputs.some(function (input) {
      return !!input.checked;
    });
    state.filterResetButton.classList.toggle(FILTER_ACTIVE_CLASS, !hasActiveFilters);
  }

  function getFilterOption(input) {
    if (!input || !input.closest) return null;
    return input.closest('.writing-feed-filter-option');
  }

  function getFilterInputValue(input) {
    if (!input) return '';

    var explicitValue = normalizeTag(
      input.getAttribute('fs-list-value') || input.getAttribute('value') || input.value
    );
    if (explicitValue) return explicitValue;

    var option = getFilterOption(input);
    var label = option ? option.querySelector('.writing-feed-filter-label') : null;
    return normalizeTag(label ? label.textContent : '');
  }

  function getDisplayFilterLabel(value) {
    return normalizeTag(value).replace(/[,.]\s*$/, '');
  }

  function isMobileFilterMode() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function updateMobileFilterButtonState() {
    if (!state.mobileFilterButtonLabel) return;

    var activeInputs = state.filterInputs.filter(function (input) {
      return !!input.checked;
    });

    if (!activeInputs.length) {
      state.mobileFilterButtonLabel.textContent = 'CATEGORIES';
      return;
    }

    if (activeInputs.length === 1) {
      state.mobileFilterButtonLabel.textContent = getDisplayFilterLabel(
        getFilterInputValue(activeInputs[0])
      ).toUpperCase();
      return;
    }

    state.mobileFilterButtonLabel.textContent = 'MULTIPLE';
  }

  function renderMobileFilterOverlayOptions() {
    if (!state.mobileFilterOverlay) return;

    var list = state.mobileFilterOverlay.querySelector('.writing-feed-mobile-overlay-list');
    if (!list) return;

    list.innerHTML = '';

    var hasActiveFilters = state.filterInputs.some(function (input) {
      return !!input.checked;
    });

    var allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className =
      'writing-feed-mobile-overlay-option mobile-filter-all' +
      (hasActiveFilters ? '' : ' writing-feed-filter-active');
    allButton.textContent = 'All';
    allButton.addEventListener('click', function () {
      handleFilterResetClick();
      scheduleMobileFilterClose(200);
    });
    list.appendChild(allButton);

    state.filterInputs.forEach(function (input) {
      var optionButton = document.createElement('button');
      optionButton.type = 'button';
      optionButton.className =
        'writing-feed-mobile-overlay-option' +
        (input.checked ? ' writing-feed-filter-active' : '');
      optionButton.textContent = getDisplayFilterLabel(getFilterInputValue(input));
      optionButton.addEventListener('click', function () {
        toggleFilterInput(input);
      });
      list.appendChild(optionButton);
    });
  }

  function clearMobileFilterCloseTimer() {
    if (!state.mobileFilterCloseTimer) return;
    clearTimeout(state.mobileFilterCloseTimer);
    state.mobileFilterCloseTimer = null;
  }

  function closeMobileFilterModal(immediate) {
    if (!state.mobileFilterOverlay) return;

    clearMobileFilterCloseTimer();

    if (immediate) {
      if (state.filterForm) {
        state.filterForm.classList.remove('is-open');
        state.filterForm.classList.remove('is-closing');
      }
      state.mobileFilterOverlay.classList.remove('is-open');
      state.mobileFilterOverlay.classList.remove('is-closing');
      document.body.classList.remove('mobile-filters-open');
      return;
    }

    if (
      !state.mobileFilterOverlay.classList.contains('is-open') &&
      !state.mobileFilterOverlay.classList.contains('is-closing')
    ) {
      return;
    }

    if (state.filterForm) {
      state.filterForm.classList.remove('is-open');
      state.filterForm.classList.add('is-closing');
    }
    state.mobileFilterOverlay.classList.remove('is-open');
    state.mobileFilterOverlay.classList.add('is-closing');
    state.mobileFilterCloseTimer = setTimeout(function () {
      if (state.filterForm) {
        state.filterForm.classList.remove('is-closing');
      }
      state.mobileFilterOverlay.classList.remove('is-closing');
      document.body.classList.remove('mobile-filters-open');
      state.mobileFilterCloseTimer = null;
    }, MOBILE_FILTER_CLOSE_DELAY);
  }

  function scheduleMobileFilterClose(delay) {
    if (!isMobileFilterMode() || !state.filterForm) return;
    if (!state.filterForm.classList.contains('is-open')) return;

    clearMobileFilterCloseTimer();
    state.mobileFilterCloseTimer = setTimeout(function () {
      closeMobileFilterModal();
    }, typeof delay === 'number' ? delay : MOBILE_FILTER_CLOSE_DELAY);
  }

  function openMobileFilterModal() {
    if (!state.filterForm || !isMobileFilterMode() || !state.mobileFilterOverlay) return;

    clearMobileFilterCloseTimer();
    renderMobileFilterOverlayOptions();
    state.filterForm.classList.remove('is-closing');
    state.filterForm.classList.add('is-open');
    state.mobileFilterOverlay.classList.remove('is-closing');
    state.mobileFilterOverlay.classList.add('is-open');
    document.body.classList.add('mobile-filters-open');
  }

  function setupMobileFilterOverlay() {
    if (!state.filterForm) return;

    if (!state.mobileFilterMediaQuery) {
      state.mobileFilterMediaQuery = window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)');
      state.mobileFilterMediaQuery.addEventListener('change', function (event) {
        if (!event.matches) {
          closeMobileFilterModal(true);
        }
      });
    }

    if (!state.mobileFilterButton) {
      var button = document.createElement('button');
      button.className = 'mobile-categories-btn';
      button.type = 'button';
      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg><span class="mobile-categories-label">CATEGORIES</span>';
      button.addEventListener('click', openMobileFilterModal);
      state.filterForm.insertBefore(button, state.filterForm.firstChild);
      state.mobileFilterButton = button;
      state.mobileFilterButtonLabel = button.querySelector('.mobile-categories-label');
    }

    if (!state.mobileFilterOverlay) {
      var overlay = document.createElement('div');
      overlay.className = 'writing-feed-mobile-overlay';
      overlay.innerHTML =
        '<div class="writing-feed-mobile-overlay-panel">' +
          '<button class="mobile-filter-close" type="button" aria-label="Close filters">&times;</button>' +
          '<div class="writing-feed-mobile-overlay-list"></div>' +
        '</div>';
      document.body.appendChild(overlay);
      state.mobileFilterOverlay = overlay;
      state.mobileFilterCloseButton = overlay.querySelector('.mobile-filter-close');
      state.mobileFilterCloseButton.addEventListener('click', function () {
        closeMobileFilterModal();
      });
    }

    updateMobileFilterButtonState();
    renderMobileFilterOverlayOptions();
  }

  function syncFilterOptionState() {
    state.filterInputs.forEach(function (input) {
      var option = getFilterOption(input);
      if (!option) return;

      option.classList.toggle(FILTER_ACTIVE_CLASS, !!input.checked);
      option.setAttribute('aria-checked', input.checked ? 'true' : 'false');
    });

    updateResetButtonState();
    updateMobileFilterButtonState();
    renderMobileFilterOverlayOptions();
  }

  function toggleFilterInput(input) {
    if (!input) return;

    input.checked = !input.checked;
    dispatchFilterEvents(input);
  }

  function dispatchFilterEvents(input) {
    if (!input) return;

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function resetAllFilters(options) {
    options = options || {};
    if (state.isResettingFilters) return false;

    var changed = false;
    state.isResettingFilters = true;

    state.filterInputs.forEach(function (input) {
      if (!input.checked) return;
      input.checked = false;
      dispatchFilterEvents(input);
      changed = true;
    });

    state.isResettingFilters = false;
    syncFilterOptionState();

    if (!changed && options.forceRender) {
      scheduleFilteredRender(true);
    }

    if (options.closeMobile && isMobileFilterMode()) {
      scheduleMobileFilterClose(200);
    }

    return changed;
  }

  function normalizeFilterInput(input) {
    if (!input) return;

    var value = getFilterInputValue(input);
    if (value) {
      input.value = value;
      input.setAttribute('value', value);
      input.setAttribute('fs-list-value', value);
    }

    input.name = 'tag';
    input.setAttribute('data-name', 'tag');

    var option = getFilterOption(input);
    if (!option) return;

    option.setAttribute('fs-list-activeclass', FILTER_ACTIVE_CLASS);
    option.setAttribute('role', 'checkbox');
    option.setAttribute('tabindex', '0');
  }

  function scheduleFilteredRender(resetScrollPosition) {
    if (state.filterRenderTimer) {
      clearTimeout(state.filterRenderTimer);
    }

    state.filterRenderTimer = setTimeout(function () {
      renderFilteredResults(!!resetScrollPosition, true);
    }, FILTER_RENDER_DEBOUNCE);
  }

  function handleFilterResetClick(event) {
    if (event) event.preventDefault();
    resetAllFilters({
      forceRender: true,
      closeMobile: true
    });
  }

  function bindFilterUi() {
    state.filterForm = document.querySelector('.writing-feed-filter-form[fs-list-element="filters"], [fs-list-element="filters"].writing-feed-filter-form');
    if (!state.filterForm) return;

    state.filterResetButton = state.filterForm.querySelector('[data-writing-filter-reset]');
    state.filterInputs = Array.prototype.slice.call(
      state.filterForm.querySelectorAll('input[fs-list-field="tag"]')
    );

    if (state.filterResetButton && state.filterResetButton.dataset.bound !== 'true') {
      state.filterResetButton.addEventListener('click', handleFilterResetClick);
      state.filterResetButton.dataset.bound = 'true';
    }

    state.filterInputs.forEach(function (input) {
      normalizeFilterInput(input);

      var option = getFilterOption(input);
      if (option && option.dataset.toggleBound !== 'true') {
        option.addEventListener('click', function (event) {
          if (event.target === input) return;
          event.preventDefault();
          toggleFilterInput(input);
        });
        option.addEventListener('keydown', function (event) {
          if (event.key !== ' ' && event.key !== 'Enter') return;
          event.preventDefault();
          toggleFilterInput(input);
        });
        option.dataset.toggleBound = 'true';
      }

      if (input.dataset.bound === 'true') return;
      input.addEventListener('change', function () {
        if (state.isResettingFilters) {
          syncFilterOptionState();
          return;
        }

        syncFilterOptionState();

        if (
          state.filterInputs.length &&
          state.filterInputs.every(function (field) { return !!field.checked; })
        ) {
          resetAllFilters();
        }
      });
      input.dataset.bound = 'true';
    });

    syncFilterOptionState();
    setupMobileFilterOverlay();
  }

  function getRenderedPanels() {
    if (!state.wrap) return [];
    return Array.prototype.slice.call(
      state.wrap.querySelectorAll('[data-horizontal-scroll-panel]')
    );
  }

  function preparePanelEntryAnimation(panels) {
    panels.forEach(function (panel) {
      panel.style.setProperty('opacity', '0', 'important');
      panel.style.setProperty('transform', 'translateY(30px)');
    });
  }

  function playPanelEntryAnimation(panels) {
    panels.forEach(function (panel, index) {
      setTimeout(function () {
        panel.style.setProperty(
          'transition',
          'opacity ' + (FILTER_ENTRY_DURATION / 1000) + 's ease, transform ' + (FILTER_ENTRY_DURATION / 1000) + 's ease'
        );
        panel.style.setProperty('opacity', '1', 'important');
        panel.style.setProperty('transform', 'translateY(0px)');
      }, index * FILTER_ENTRY_STAGGER);
    });
  }

  function renderFilteredResults(resetScrollPosition, animatePanels) {
    if (state.filterTransitionTimer) {
      clearTimeout(state.filterTransitionTimer);
      state.filterTransitionTimer = null;
    }

    function runBuild() {
      state.currentMaxCards = getMaxSmallCards();
      buildLayout(getVisibleItems(), !!resetScrollPosition, !!animatePanels);
      syncResponsivePanelWidth();
      syncShellMetrics();
      refreshAfterImagesLoad();
    }

    var existingPanels = animatePanels ? getRenderedPanels() : [];
    if (!existingPanels.length) {
      runBuild();
      return;
    }

    existingPanels.forEach(function (panel) {
      panel.style.setProperty(
        'transition',
        'opacity ' + (FILTER_EXIT_DURATION / 1000) + 's ease, transform ' + (FILTER_EXIT_DURATION / 1000) + 's ease'
      );
      panel.style.setProperty('opacity', '0', 'important');
      panel.style.setProperty('transform', 'translateY(20px)');
    });

    state.filterTransitionTimer = setTimeout(function () {
      state.filterTransitionTimer = null;
      runBuild();
    }, FILTER_EXIT_DURATION);
  }

  function bindFilterObserver() {
    if (!state.sourceList) return;

    if (state.filterObserver) {
      state.filterObserver.disconnect();
    }

    state.filterObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === 'childList') {
          scheduleFilteredRender(true);
          return;
        }

        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'style' ||
            mutation.attributeName === 'class' ||
            mutation.attributeName === 'hidden')
        ) {
          scheduleFilteredRender(true);
          return;
        }
      }
    });

    state.filterObserver.observe(state.sourceList, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
  }

  function restartFinsweetListModule() {
    var listModule =
      window.FinsweetAttributes &&
      window.FinsweetAttributes.modules &&
      window.FinsweetAttributes.modules.list;

    if (!listModule || typeof listModule.restart !== 'function') {
      return Promise.resolve(false);
    }

    try {
      return Promise.resolve(listModule.restart()).then(function () {
        return true;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function ensureFinsweetLoaded() {
    window.fsAttributes = window.fsAttributes || [];
    return Promise.resolve();
  }

  function setupHoverEffects() {
    if (!state.wrap) return;

    if (!state.hoverMediaQuery) {
      state.hoverMediaQuery = window.matchMedia(HOVER_MEDIA_QUERY);
      if (state.hoverMediaQuery.addEventListener) {
        state.hoverMediaQuery.addEventListener('change', updateHoverMode);
      } else if (state.hoverMediaQuery.addListener) {
        state.hoverMediaQuery.addListener(updateHoverMode);
      }
    }

    if (state.wrap.dataset.hoverBound !== 'true') {
      state.wrap.addEventListener('mouseover', handleCardMouseOver);
      state.wrap.addEventListener('mouseout', handleCardMouseOut);
      state.wrap.addEventListener('mouseleave', handleWrapMouseLeave);
      state.wrap.dataset.hoverBound = 'true';
    }

    updateHoverMode();
  }

  function getScrollDistance() {
    if (!state.wrap) return 0;

    if (state.trackEl) {
      return Math.max(state.trackEl.scrollWidth - state.wrap.clientWidth, 0);
    }

    state.wrap.style.overflow = 'hidden';
    var distance = state.wrap.scrollWidth - state.wrap.clientWidth;
    state.wrap.style.removeProperty('overflow');
    return Math.max(distance, 0);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function getTrackEdgeInset() {
    if (!state.wrap || !state.trackEl) return 0;

    var firstPanel = state.trackEl.querySelector('[data-horizontal-scroll-panel]');
    if (!firstPanel) return 0;

    var wrapRect = state.wrap.getBoundingClientRect();
    var panelRect = firstPanel.getBoundingClientRect();
    return Math.max(Math.round(panelRect.left - wrapRect.left), 0);
  }

  function syncResponsivePanelWidth() {
    if (!state.wrap) return;

    var wrapStyles = window.getComputedStyle(state.wrap);
    var paddingLeft = parseFloat(wrapStyles.paddingLeft) || 0;
    var paddingRight = parseFloat(wrapStyles.paddingRight) || 0;
    var innerWidth = Math.max(state.wrap.clientWidth - paddingLeft - paddingRight, 0);

    state.wrap.style.setProperty('--writing-feed-panel-width', innerWidth + 'px');
  }

  function syncTrackTrailingInset() {
    if (!state.trackEl) return;

    state.trackEl.style.width = 'max-content';
    var inset = getTrackEdgeInset();
    state.trackEl.style.paddingRight = '0px';

    var panels = state.trackEl.querySelectorAll('[data-horizontal-scroll-panel]');
    Array.prototype.forEach.call(panels, function (panel) {
      panel.style.marginRight = '0px';
    });

    var baseWidth = state.trackEl.scrollWidth;
    state.trackEl.style.width = baseWidth + (inset * 2) + 'px';
  }

  function isDesktopRail() {
    return true;
  }

  function syncShellMetrics() {
    if (typeof window.syncShellMetrics === 'function') {
      window.syncShellMetrics();
    }
  }

  function getSharedAncestor(firstNode, secondNode) {
    if (!firstNode || !secondNode) return null;

    var firstAncestors = [];
    var current = firstNode;
    while (current) {
      firstAncestors.push(current);
      current = current.parentElement;
    }

    current = secondNode;
    while (current) {
      if (firstAncestors.indexOf(current) !== -1) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function ensurePinShell() {
    if (!state.pinSection) return null;

    if (
      state.pinShell &&
      state.pinShell.parentNode &&
      state.pinSection.parentNode === state.pinShell
    ) {
      return state.pinShell;
    }

    var existingShell = state.pinSection.parentElement;
    if (existingShell && existingShell.classList.contains('writing-feed-pin-shell')) {
      state.pinShell = existingShell;
      return existingShell;
    }

    var shell = document.createElement('div');
    shell.className = 'writing-feed-pin-shell';
    state.pinSection.parentNode.insertBefore(shell, state.pinSection);
    shell.appendChild(state.pinSection);
    state.pinShell = shell;
    return shell;
  }

  function getVerticalLeadDistance() {
    if (!state.wrap) return 0;

    var wrapRect = state.wrap.getBoundingClientRect();
    var targetTop = (window.innerHeight - wrapRect.height) / 2;
    return Math.max(Math.round(wrapRect.top - targetTop), 0);
  }

  function getCompactEntryHoldDistance() {
    return clamp(Math.round(window.innerHeight * 0.14), MOBILE_ENTRY_HOLD_MIN, MOBILE_ENTRY_HOLD_MAX);
  }

  function getCompactExitHoldDistance() {
    return clamp(Math.round(window.innerHeight * 0.18), MOBILE_EXIT_HOLD_MIN, MOBILE_EXIT_HOLD_MAX);
  }

  function getClosestSnapPoint(points, value) {
    if (!points || !points.length) return value;

    var closest = points[0];
    var minDelta = Math.abs(value - closest);
    for (var i = 1; i < points.length; i++) {
      var delta = Math.abs(value - points[i]);
      if (delta < minDelta) {
        closest = points[i];
        minDelta = delta;
      }
    }

    return closest;
  }

  function getCompactSnapPoints(entryHold, horizontalDistance, exitHold, panelCount) {
    var totalDistance = entryHold + horizontalDistance + exitHold;
    if (totalDistance <= 0 || panelCount <= 0) return null;

    var snapPoints = [];
    var segments = Math.max(panelCount - 1, 1);

    snapPoints.push(entryHold / totalDistance);

    for (var i = 0; i <= segments; i++) {
      snapPoints.push((entryHold + ((horizontalDistance * i) / segments)) / totalDistance);
    }

    return snapPoints.filter(function (point, index, array) {
      return index === 0 || Math.abs(point - array[index - 1]) > 0.0005;
    });
  }

  function getDirectWritingFeedTrack() {
    if (!state.wrap) return null;

    for (var i = 0; i < state.wrap.children.length; i++) {
      var child = state.wrap.children[i];
      if (child.classList && child.classList.contains('writing-feed-track')) {
        return child;
      }
    }

    return null;
  }

  function initScrolling() {
    teardownScroll();
    if (!state.wrap || !isDesktopRail()) return;

    syncResponsivePanelWidth();

    var track = getDirectWritingFeedTrack();

    if (!track) {
      track = document.createElement('div');
      track.className = 'writing-feed-track';

      while (state.wrap.firstChild) {
        track.appendChild(state.wrap.firstChild);
      }

      state.wrap.appendChild(track);
    }

    state.trackEl = track;
    syncTrackTrailingInset();

    if (!hasGsapSupport()) return;

    var pinShell = ensurePinShell();
    var isCompactRail = window.innerWidth <= MOBILE_BREAKPOINT;
    var verticalLead = isCompactRail ? 0 : getVerticalLeadDistance();
    var compactEntryHold = isCompactRail ? getCompactEntryHoldDistance() : 0;
    var compactExitHold = isCompactRail ? getCompactExitHoldDistance() : 0;
    var horizontalDistance = getScrollDistance();
    var totalDistance = verticalLead + compactEntryHold + horizontalDistance + compactExitHold;
    var compactSnapPoints = isCompactRail
      ? getCompactSnapPoints(compactEntryHold, horizontalDistance, compactExitHold, track.children.length)
      : null;

    if (!pinShell || totalDistance <= 0) return;

    registerGsapPlugin();

    state.scrollTween = window.gsap.timeline({
      defaults: {
        ease: 'none',
        overwrite: 'auto'
      },
      scrollTrigger: {
        trigger: isCompactRail ? state.wrap : pinShell,
        start: isCompactRail ? 'center center' : 'top top',
        end: function () {
          var compactLead = window.innerWidth <= MOBILE_BREAKPOINT ? 0 : getVerticalLeadDistance();
          var entryHold = window.innerWidth <= MOBILE_BREAKPOINT ? getCompactEntryHoldDistance() : 0;
          var exitHold = window.innerWidth <= MOBILE_BREAKPOINT ? getCompactExitHoldDistance() : 0;
          return '+=' + (compactLead + entryHold + getScrollDistance() + exitHold);
        },
        pin: pinShell,
        scrub: true,
        snap: isCompactRail && compactSnapPoints ? {
          snapTo: function (value) {
            return getClosestSnapPoint(compactSnapPoints, value);
          },
          duration: { min: 0.1, max: 0.18 },
          delay: 0,
          ease: 'power1.inOut',
          inertia: false,
          directional: false
        } : false,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onToggle: function (trigger) {
          pinShell.classList.toggle('is-pinned', trigger.isActive);
        },
        onRefresh: function (trigger) {
          pinShell.classList.toggle('is-pinned', trigger.isActive);
        }
      }
    });

    if (verticalLead > 0) {
      state.scrollTween.to(state.pinSection, {
        y: -verticalLead,
        duration: verticalLead
      });
    }

    if (compactEntryHold > 0) {
      state.scrollTween.to({}, {
        duration: compactEntryHold
      });
    }

    state.scrollTween.to(track, {
      x: -horizontalDistance,
      duration: horizontalDistance
    });

    if (compactExitHold > 0) {
      state.scrollTween.to({}, {
        duration: compactExitHold
      });
    }

    state.scrollTween.scrollTrigger.refresh();
  }

  function normalizeTag(value) {
    return value ? String(value).trim() : '';
  }

  function getItemTag(item) {
    return getTemporaryTag(item);
  }

  function updateCardTag(panel, tag) {
    var tagText = panel.querySelector('.tag-text');
    if (!tagText) return;
    tagText.textContent = tag || '';
  }

  function populateCard(panel, data, removeDimensions) {
    if (!panel) return;

    var card = panel;
    if (!card.classList || !card.classList.contains('demo-card')) {
      card = panel.querySelector('.demo-card');
    }

    var image = panel.querySelector('img');
    var title = panel.querySelector('h1, h2, h3, h4, h5, h6');
    var summary = panel.querySelector('.writing_item-description');

    if (card) {
      if (data.link) {
        card.href = data.link;
      } else {
        card.removeAttribute('href');
      }
    }

    if (image) {
      if (data.image) {
        image.src = data.image;
      } else {
        image.removeAttribute('src');
      }
      image.alt = data.imageAlt;
      image.loading = 'lazy';
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      if (removeDimensions) {
        image.removeAttribute('width');
        image.removeAttribute('height');
      }
    }

    if (title) {
      title.textContent = data.title;
    }

    if (summary) {
      summary.textContent = data.summary;
    }

    updateCardTag(panel, data.tag);
  }

  function buildLayout(items, resetScrollPosition, animatePanels) {
    if (!state.wrap || !state.largeTemplate || !state.smallTemplate) return;

    clearHoverState();
    teardownScroll();
    state.wrap.scrollLeft = 0;

    var existingEmptyState = state.wrap.querySelector('.writing-feed-empty');
    if (existingEmptyState) {
      existingEmptyState.remove();
    }

    if (resetScrollPosition) {
      var wrapTop = state.wrap.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({
        top: Math.max(wrapTop, 0),
        behavior: 'smooth'
      });
    }

    Array.prototype.forEach.call(
      state.wrap.querySelectorAll('[data-horizontal-scroll-panel]'),
      function (panel) {
        panel.remove();
      }
    );

    if (!items.length) {
      var emptyState = document.createElement('div');
      emptyState.className = 'writing-feed-empty';
      emptyState.textContent = 'No writings found for this category.';
      state.wrap.appendChild(emptyState);
      state.wrap.style.setProperty('opacity', '1', 'important');
      return;
    }

    var index = 0;
    while (index < items.length) {
      var largePanel = state.largeTemplate.cloneNode(true);
      largePanel.removeAttribute('data-template');
      largePanel.setAttribute('data-horizontal-scroll-panel', '');
      populateCard(largePanel, items[index], false);
      state.wrap.appendChild(largePanel);
      index++;

      var smallCount = Math.min(state.currentMaxCards, items.length - index);
      if (smallCount <= 0) {
        continue;
      }

      var smallPanel = state.smallTemplate.cloneNode(true);
      smallPanel.removeAttribute('data-template');
      smallPanel.setAttribute('data-horizontal-scroll-panel', '');

      var cardSlots = smallPanel.querySelectorAll('.demo-card');
      for (var i = 0; i < cardSlots.length; i++) {
        if (i < smallCount) {
          populateCard(cardSlots[i], items[index], true);
          index++;
          continue;
        }
        cardSlots[i].remove();
      }

      state.wrap.appendChild(smallPanel);
    }

    var renderedPanels = animatePanels ? getRenderedPanels() : [];
    if (animatePanels && renderedPanels.length) {
      preparePanelEntryAnimation(renderedPanels);
    }

    state.wrap.style.setProperty('opacity', '1', 'important');
    state.wrap.scrollLeft = 0;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initScrolling();
        if (animatePanels && renderedPanels.length) {
          requestAnimationFrame(function () {
            playPanelEntryAnimation(renderedPanels);
          });
        }
      });
    });
  }

  function render(resetScrollPosition) {
    renderFilteredResults(!!resetScrollPosition, false);
  }

  function refreshAfterImagesLoad() {
    if (!state.wrap) return;

    var images = state.wrap.querySelectorAll('img');
    if (!images.length) {
      syncShellMetrics();
      refreshScroll();
      return;
    }

    var loaded = 0;
    function onImageDone() {
      loaded++;
      if (loaded >= images.length) {
        syncShellMetrics();
        refreshScroll();
      }
    }

    Array.prototype.forEach.call(images, function (image) {
      if (image.complete) {
        onImageDone();
        return;
      }

      image.addEventListener('load', onImageDone, { once: true });
      image.addEventListener('error', onImageDone, { once: true });
    });
  }

  function handleResize() {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(function () {
      var nextMaxCards = getMaxSmallCards();
      if (nextMaxCards !== state.currentMaxCards) {
        render(true);
        return;
      }

      syncResponsivePanelWidth();
      syncTrackTrailingInset();
      refreshScroll();
    }, RESIZE_DEBOUNCE);
  }

  function applyTheme() {
    document.body.classList.add('writing-feed-page');
  }

  function initWritingsLayout() {
    if (window[INIT_KEY]) return;

    var wrap = document.querySelector('[data-horizontal-scroll-wrap]');
    var list = document.querySelector('[data-writings-list]');
    var sourceList = list && list.querySelector('[fs-list-element="list"]');
    var hero = document.querySelector('.hero_section');
    var largeTemplate = wrap && wrap.querySelector('[data-template="large"]');
    var smallTemplate = wrap && wrap.querySelector('[data-template="small"]');

    if (!wrap || !list || !sourceList || !hero || !largeTemplate || !smallTemplate) return;

    window[INIT_KEY] = true;

    state.wrap = wrap;
    state.hero = hero;
    state.pinSection = getSharedAncestor(hero, wrap) || wrap;
    state.largeTemplate = largeTemplate.cloneNode(true);
    state.smallTemplate = smallTemplate.cloneNode(true);
    state.sourceList = sourceList;

    var serverRenderedTrack = getDirectWritingFeedTrack();
    var hasServerRenderedLayout = !!(
      serverRenderedTrack &&
      serverRenderedTrack.querySelector('[data-horizontal-scroll-panel]')
    );

    populateTemporaryFilterTags();
    bindFilterUi();
    bindFilterObserver();
    ensureFinsweetLoaded()
      .then(function () {
        populateTemporaryFilterTags();
        return restartFinsweetListModule();
      })
      .catch(function (error) {
        console.warn('[Writing Feed]', error.message);
      });

    if (hasServerRenderedLayout) {
      Array.prototype.forEach.call(
        wrap.querySelectorAll('[data-template]'),
        function (node) {
          node.remove();
        }
      );

      applyTheme();
      setupHoverEffects();
      state.currentMaxCards = getMaxSmallCards();
      state.wrap.style.setProperty('opacity', '1', 'important');
      initScrolling();
      refreshAfterImagesLoad();
    } else {
      Array.prototype.forEach.call(
        wrap.querySelectorAll('[data-horizontal-scroll-panel], [data-template]'),
        function (node) {
          node.remove();
        }
      );

      Array.prototype.forEach.call(
        wrap.querySelectorAll('.writing-feed-track'),
        function (track) {
          track.remove();
        }
      );

      applyTheme();
      setupHoverEffects();
      render(false);
    }

    window.addEventListener('resize', handleResize);

    if (document.readyState === 'complete') {
      setTimeout(function () {
        syncShellMetrics();
        refreshScroll();
      }, IMAGE_REFRESH_DELAY);
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () {
          syncShellMetrics();
          refreshScroll();
        }, IMAGE_REFRESH_DELAY);
      }, { once: true });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        syncShellMetrics();
        refreshScroll();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWritingsLayout);
  } else {
    initWritingsLayout();
  }
})();
