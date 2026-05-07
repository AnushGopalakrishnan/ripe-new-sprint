(function () {
  'use strict';

  var LOG_PREFIX = '[Case Study Detail]';
  var PATH_PREFIX = '/case-studies/';

  function warn(message) {
    console.warn(LOG_PREFIX, message);
  }

  function isDetailPage() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    return path.indexOf(PATH_PREFIX) === 0 && path !== '/case-studies';
  }

  function normalizeUrl(value) {
    if (!value) return '';
    try {
      return new URL(value, window.location.origin).toString();
    } catch (_) {
      return value;
    }
  }

  function readDirectValue(element) {
    if (!element) return '';

    if (element.hasAttribute('data-value')) {
      return element.getAttribute('data-value').trim();
    }

    if (element.matches('img') && element.currentSrc) return element.currentSrc;
    if (element.matches('img') && element.getAttribute('src')) return element.getAttribute('src');
    if (element.matches('source') && element.getAttribute('src')) return element.getAttribute('src');
    if (element.matches('video') && element.getAttribute('src')) return element.getAttribute('src');
    if (element.matches('a') && element.getAttribute('href')) return element.getAttribute('href');
    if (element.hasAttribute('src')) return element.getAttribute('src');
    if (element.hasAttribute('href')) return element.getAttribute('href');

    var nested = element.querySelector('img, source, video, a[href]');
    if (nested) {
      return readDirectValue(nested);
    }

    return (element.textContent || '').trim();
  }

  function readField(scope, fieldNames) {
    var names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      var fieldEls = Array.prototype.slice.call(
        scope.querySelectorAll('[data-field="' + name + '"]')
      );
      if (!fieldEls.length) continue;

      var mediaEls = fieldEls.filter(function (element) {
        return /^(IMG|VIDEO|SOURCE)$/i.test(element.tagName || '');
      });
      var preferredEl = mediaEls.length ? mediaEls[mediaEls.length - 1] : fieldEls[fieldEls.length - 1];
      var value = readDirectValue(preferredEl);
      if (value) return value;
    }

    return '';
  }

  function readFieldHtml(scope, fieldNames) {
    var names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

    for (var i = 0; i < names.length; i++) {
      var fieldEl = scope.querySelector('[data-field="' + names[i] + '"]');
      if (fieldEl && fieldEl.innerHTML && fieldEl.innerHTML.trim()) {
        return fieldEl.innerHTML.trim();
      }
    }

    return '';
  }

  function readSourceValue(source, attrName, fieldNames) {
    if (source && source.hasAttribute(attrName)) {
      var attrValue = source.getAttribute(attrName);
      if (attrValue) return attrValue.trim();
    }
    return readField(source, fieldNames);
  }

  function parseOrder(rowEl, index) {
    var rawOrder = rowEl.getAttribute('data-row-order') || readField(rowEl, 'row-order');
    var order = Number(rawOrder);
    if (!isFinite(order)) {
      warn('Skipping row #' + (index + 1) + ' because its order is missing or invalid.');
      return null;
    }
    return order;
  }

  function parseLayout(rowEl) {
    var layout = (
      rowEl.getAttribute('data-row-layout') ||
      readField(rowEl, 'row-layout') ||
      ''
    )
      .trim()
      .toLowerCase();

    if (layout === 'one-column' || layout === 'two-column') {
      return layout;
    }

    warn('Skipping row with unsupported layout "' + layout + '".');
    return '';
  }

  function emptyColumn() {
    return {
      mediaType: 'none',
      imageUrl: '',
      mp4Url: '',
      webmUrl: '',
      hlsUrl: '',
      posterUrl: '',
      alt: ''
    };
  }

  function normalizeColumn(rowEl, columnIndex, layout, order) {
    var colMatches = Array.prototype.slice.call(rowEl.querySelectorAll('[data-col="' + columnIndex + '"]'));
    var colEl = colMatches.length ? colMatches[colMatches.length - 1] : null;
    if (!colEl) {
      if (layout === 'one-column' && columnIndex === 2) {
        return emptyColumn();
      }
      warn('Row ' + order + ' is missing column ' + columnIndex + '.');
      return emptyColumn();
    }

    var mediaType = (
      colEl.getAttribute('data-col-media-type') ||
      readField(colEl, 'media-type') ||
      ''
    )
      .trim()
      .toLowerCase();

    if (layout === 'one-column' && columnIndex === 2) {
      mediaType = 'none';
    }

    var column = {
      mediaType: mediaType || 'none',
      imageUrl: normalizeUrl(readField(colEl, ['image', 'gif'])),
      mp4Url: normalizeUrl(readField(colEl, 'mp4')),
      webmUrl: normalizeUrl(readField(colEl, 'webm')),
      hlsUrl: normalizeUrl(readField(colEl, 'hls')),
      posterUrl: normalizeUrl(readField(colEl, 'poster')),
      alt: readField(colEl, 'alt')
    };

    if (!column.alt) {
      var imageField = colEl.querySelector('[data-field="image"] img, [data-field="gif"] img');
      if (imageField && imageField.getAttribute('alt')) {
        column.alt = imageField.getAttribute('alt').trim();
      }
    }

    if (column.mediaType === 'image' || column.mediaType === 'gif') {
      if (!column.imageUrl) {
        warn('Row ' + order + ' column ' + columnIndex + ' is missing an image asset.');
        return emptyColumn();
      }
      return column;
    }

    if (column.mediaType === 'loop-video') {
      if (!column.webmUrl && !column.mp4Url) {
        warn('Row ' + order + ' column ' + columnIndex + ' is missing loop video sources.');
        return emptyColumn();
      }
      return column;
    }

    if (column.mediaType === 'long-video') {
      if (!column.hlsUrl) {
        warn('Row ' + order + ' column ' + columnIndex + ' is missing its HLS URL.');
        return emptyColumn();
      }
      return column;
    }

    if (column.mediaType === 'none' || !column.mediaType) {
      return emptyColumn();
    }

    warn('Row ' + order + ' column ' + columnIndex + ' has unsupported media type "' + column.mediaType + '".');
    return emptyColumn();
  }

  function getRowElements(source) {
    var explicitRows = source.querySelectorAll('[data-case-study-row]');
    if (explicitRows.length) {
      return Array.prototype.slice.call(explicitRows);
    }

    return Array.prototype.filter.call(source.children, function (child) {
      return child.hasAttribute('data-row-order') || child.hasAttribute('data-row-layout') || !!child.querySelector('[data-col]');
    });
  }

  function parseRows(source) {
    return getRowElements(source)
      .map(function (rowEl, index) {
        var order = parseOrder(rowEl, index);
        var layout = parseLayout(rowEl);
        if (!isFinite(order) || !layout) return null;

        return {
          order: order,
          layout: layout,
          columns: [
            normalizeColumn(rowEl, 1, layout, order),
            normalizeColumn(rowEl, 2, layout, order)
          ]
        };
      })
      .filter(Boolean)
      .sort(function (a, b) {
        return a.order - b.order;
      });
  }

  function findLegacyRowsSource() {
    return (
      document.querySelector('.main + .w-dyn-list') ||
      document.querySelector('[fs-list-element="wrapper"]') ||
      document.querySelector('.w-dyn-list')
    );
  }

  function parseTestimonial() {
    var source = document.querySelector('[data-case-study-testimonial-source]');
    if (!source) return null;

    var quote = readSourceValue(source, 'data-testimonial-quote', ['quote', 'testimonial-quote']);
    if (!quote) return null;

    var quoteHtml = readFieldHtml(source, ['quote', 'testimonial-quote']);

    var insertAfterOrder = Number(
      readSourceValue(source, 'data-testimonial-insert-after-order', ['insert-after-order', 'testimonial-insert-after-order'])
    );

    if (!isFinite(insertAfterOrder)) {
      warn('Suppressing testimonial because testimonial-insert-after-order is missing or invalid.');
      return null;
    }

    return {
      quote: quote,
      quoteHtml: quoteHtml,
      name: readSourceValue(source, 'data-testimonial-name', ['name', 'testimonial-name']),
      role: readSourceValue(source, 'data-testimonial-role', ['role', 'testimonial-role']),
      company: readSourceValue(source, 'data-testimonial-company', ['company', 'testimonial-company']),
      avatarUrl:
        normalizeUrl(readSourceValue(source, 'data-testimonial-avatar', ['avatar', 'testimonial-avatar'])) ||
        normalizeUrl(readDirectValue(source.querySelector('img'))),
      insertAfterOrder: insertAfterOrder
    };
  }

  function makeElement(tagName, className) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    return element;
  }

  function renderImage(column) {
    var image = makeElement('img', 'case-study-column__asset case-study-column__asset--image');
    image.src = column.imageUrl;
    image.alt = column.alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function renderLoopVideo(column) {
    var video = makeElement('video', 'case-study-column__asset case-study-column__asset--video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = 'metadata';
    if (column.posterUrl) {
      video.poster = column.posterUrl;
    }
    if (column.alt) {
      video.setAttribute('aria-label', column.alt);
    }

    if (column.webmUrl) {
      var webmSource = document.createElement('source');
      webmSource.src = column.webmUrl;
      webmSource.type = 'video/webm';
      video.appendChild(webmSource);
    }

    if (column.mp4Url) {
      var mp4Source = document.createElement('source');
      mp4Source.src = column.mp4Url;
      mp4Source.type = 'video/mp4';
      video.appendChild(mp4Source);
    }

    return video;
  }

  function renderLongVideo(column) {
    var player = makeElement('div', 'case-study-player');
    player.setAttribute('data-bunny-player-init', '');
    player.setAttribute('data-player-src', column.hlsUrl);
    player.setAttribute('data-player-status', 'idle');
    player.setAttribute('data-player-hover', 'idle');
    player.setAttribute('data-player-muted', 'false');
    player.setAttribute('data-player-lazy', 'meta');
    player.setAttribute('data-player-update-size', 'true');
    player.setAttribute('data-player-fullscreen', 'false');
    player.setAttribute('data-timeline-drag', 'false');

    if (column.alt) {
      player.setAttribute('aria-label', column.alt);
    }

    var before = makeElement('div', 'case-study-player__before');
    before.setAttribute('data-player-before', '');
    player.appendChild(before);

    var video = makeElement('video', 'case-study-player__video');
    video.preload = 'metadata';
    if (column.posterUrl) {
      video.poster = column.posterUrl;
    }
    player.appendChild(video);

    var chrome = makeElement('div', 'case-study-player__chrome');
    var playButton = makeElement('button', 'case-study-player__play');
    playButton.type = 'button';
    playButton.setAttribute('data-player-control', 'playpause');
    playButton.setAttribute('aria-label', 'Play or pause video');
    playButton.textContent = 'Play';
    chrome.appendChild(playButton);

    var controls = makeElement('div', 'case-study-player__controls');
    var timeline = makeElement('div', 'case-study-player__timeline');
    timeline.setAttribute('data-player-timeline', '');
    timeline.setAttribute('role', 'slider');
    timeline.setAttribute('aria-label', 'Video timeline');

    var buffered = makeElement('span', 'case-study-player__buffered');
    buffered.setAttribute('data-player-buffered', '');
    timeline.appendChild(buffered);

    var progress = makeElement('span', 'case-study-player__progress');
    progress.setAttribute('data-player-progress', '');
    timeline.appendChild(progress);

    var handle = makeElement('span', 'case-study-player__handle');
    handle.setAttribute('data-player-timeline-handle', '');
    timeline.appendChild(handle);

    var meta = makeElement('div', 'case-study-player__meta');
    var timeCurrent = makeElement('span', 'case-study-player__time');
    timeCurrent.setAttribute('data-player-time-progress', '');
    timeCurrent.textContent = '00:00';
    meta.appendChild(timeCurrent);

    var timeDivider = makeElement('span', 'case-study-player__time-divider');
    timeDivider.textContent = '/';
    meta.appendChild(timeDivider);

    var timeTotal = makeElement('span', 'case-study-player__time');
    timeTotal.setAttribute('data-player-time-duration', '');
    timeTotal.textContent = '00:00';
    meta.appendChild(timeTotal);

    var rightControls = makeElement('div', 'case-study-player__buttons');

    var muteButton = makeElement('button', 'case-study-player__button');
    muteButton.type = 'button';
    muteButton.setAttribute('data-player-control', 'mute');
    muteButton.setAttribute('aria-label', 'Mute or unmute video');
    muteButton.textContent = 'Mute';
    rightControls.appendChild(muteButton);

    var fullscreenButton = makeElement('button', 'case-study-player__button');
    fullscreenButton.type = 'button';
    fullscreenButton.setAttribute('data-player-control', 'fullscreen');
    fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenButton.textContent = 'Full';
    rightControls.appendChild(fullscreenButton);

    controls.appendChild(timeline);
    controls.appendChild(meta);
    controls.appendChild(rightControls);
    chrome.appendChild(controls);
    player.appendChild(chrome);

    return player;
  }

  function renderMedia(column) {
    if (column.mediaType === 'image' || column.mediaType === 'gif') {
      return renderImage(column);
    }

    if (column.mediaType === 'loop-video') {
      return renderLoopVideo(column);
    }

    if (column.mediaType === 'long-video') {
      return renderLongVideo(column);
    }

    return null;
  }

  function renderColumn(column, rowOrder, columnIndex) {
    if (!column || column.mediaType === 'none') return null;

    var cell = makeElement('div', 'case-study-column');
    cell.setAttribute('data-case-column', '');
    cell.setAttribute('data-column-index', String(columnIndex));
    cell.setAttribute('data-row-order', String(rowOrder));
    cell.setAttribute('data-media-type', column.mediaType);

    var mediaShell = makeElement('div', 'case-study-column__media');
    var media = renderMedia(column);
    if (!media) return null;
    mediaShell.appendChild(media);

    var overlay = makeElement('div', 'case-study-column__overlay');
    overlay.setAttribute('data-case-column-overlay', '');
    mediaShell.appendChild(overlay);

    cell.appendChild(mediaShell);
    return cell;
  }

  function renderRow(row) {
    var visibleColumns = row.columns
      .map(function (column, index) {
        return renderColumn(column, row.order, index + 1);
      })
      .filter(Boolean);

    if (!visibleColumns.length) {
      warn('Skipping row ' + row.order + ' because it has no renderable media.');
      return null;
    }

    var rowEl = makeElement('section', 'case-study-row');
    rowEl.setAttribute('data-case-study-row-rendered', '');
    rowEl.setAttribute('data-row-layout', row.layout);
    rowEl.setAttribute('data-row-order', String(row.order));
    rowEl.setAttribute('data-row-effective-columns', String(visibleColumns.length));

    var grid = makeElement('div', 'case-study-row__grid');
    visibleColumns.forEach(function (columnEl) {
      grid.appendChild(columnEl);
    });
    rowEl.appendChild(grid);

    return rowEl;
  }

  function renderTestimonial(testimonial) {
    var section = makeElement('section', 'case-study-testimonial');
    section.setAttribute('data-case-study-testimonial', '');
    section.setAttribute('data-insert-after-order', String(testimonial.insertAfterOrder));

    var inner = makeElement('div', 'case-study-testimonial__inner');
    var quote = makeElement('blockquote', 'case-study-testimonial__quote');
    if (testimonial.quoteHtml) {
      quote.innerHTML = testimonial.quoteHtml;
    } else {
      quote.textContent = testimonial.quote;
    }
    inner.appendChild(quote);

    var meta = makeElement('div', 'case-study-testimonial__meta');
    if (testimonial.avatarUrl) {
      var avatar = makeElement('img', 'case-study-testimonial__avatar');
      avatar.src = testimonial.avatarUrl;
      avatar.alt = testimonial.name ? testimonial.name : '';
      avatar.loading = 'lazy';
      avatar.decoding = 'async';
      meta.appendChild(avatar);
    }

    var identity = makeElement('div', 'case-study-testimonial__identity');
    if (testimonial.name) {
      var name = makeElement('div', 'case-study-testimonial__name');
      name.textContent = testimonial.name;
      identity.appendChild(name);
    }

    var role = [testimonial.role, testimonial.company].filter(Boolean).join(', ');
    if (role) {
      var roleEl = makeElement('div', 'case-study-testimonial__role');
      roleEl.textContent = role;
      identity.appendChild(roleEl);
    }

    meta.appendChild(identity);
    inner.appendChild(meta);
    section.appendChild(inner);
    return section;
  }

  function renderRows(mount, rows, testimonial) {
    var fragment = document.createDocumentFragment();
    var wrapper = makeElement('div', 'case-study-rows');
    wrapper.setAttribute('data-case-study-rows', '');

    var testimonialInserted = false;

    rows.forEach(function (row) {
      var rowEl = renderRow(row);
      if (rowEl) {
        wrapper.appendChild(rowEl);
      }

      if (testimonial && !testimonialInserted && row.order === testimonial.insertAfterOrder) {
        wrapper.appendChild(renderTestimonial(testimonial));
        testimonialInserted = true;
      }
    });

    if (testimonial && !testimonialInserted) {
      warn(
        'Suppressing testimonial because row order ' +
          testimonial.insertAfterOrder +
          ' does not exist in the current case study.'
      );
    }

    mount.innerHTML = '';
    fragment.appendChild(wrapper);
    mount.appendChild(fragment);
  }

  function initLoopVideos(scope) {
    scope.querySelectorAll('.case-study-column__asset--video').forEach(function (video) {
      if (video.getAttribute('data-loop-video-bound') === 'true') return;
      video.setAttribute('data-loop-video-bound', 'true');
      video.muted = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  function markReady() {
    document.documentElement.setAttribute('data-case-study-ready', 'true');
  }

  function initDetailBuilder() {
    if (!isDetailPage()) return;

    var mount = document.querySelector('[data-case-study-rows-mount]');
    var source = document.querySelector('[data-case-study-rows-source]') || findLegacyRowsSource();

    if (!mount) {
      warn('Missing [data-case-study-rows-mount].');
      markReady();
      return;
    }

    if (!source) {
      warn('Missing [data-case-study-rows-source].');
      markReady();
      return;
    }

    var rows = parseRows(source);
    var testimonial = parseTestimonial();

    renderRows(mount, rows, testimonial);
    initLoopVideos(mount);

    if (window.RipeMediaPlayer && typeof window.RipeMediaPlayer.init === 'function') {
      window.RipeMediaPlayer.init(mount);
    } else {
      warn('Shared media player runtime was not available for long-form videos.');
    }

    markReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailBuilder);
  } else {
    initDetailBuilder();
  }
})();
