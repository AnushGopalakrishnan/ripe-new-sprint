(function () {
  'use strict';

  function initBunnyPlayer(root) {
    var scope = root && root.querySelectorAll ? root : document;

    scope
      .querySelectorAll('[data-bunny-player-init]')
      .forEach(function (player) {
        if (player.getAttribute('data-ripe-player-bound') === 'true') return;
        player.setAttribute('data-ripe-player-bound', 'true');

        var src = player.getAttribute('data-player-src');
        if (!src) return;

        var video = player.querySelector('video');
        if (!video) return;

        try {
          video.pause();
        } catch (_) {}
        try {
          video.removeAttribute('src');
          video.load();
        } catch (_) {}

        function setStatus(status) {
          if (player.getAttribute('data-player-status') !== status) {
            player.setAttribute('data-player-status', status);
          }
        }

        function setMutedState(value) {
          video.muted = !!value;
          player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
        }

        function setFullscreenState(value) {
          player.setAttribute('data-player-fullscreen', value ? 'true' : 'false');
        }

        function setActivated(value) {
          player.setAttribute('data-player-activated', value ? 'true' : 'false');
        }

        if (!player.hasAttribute('data-player-status')) {
          setStatus('idle');
        }
        if (!player.hasAttribute('data-player-activated')) {
          setActivated(false);
        }

        var timeline = player.querySelector('[data-player-timeline]');
        var progressBar = player.querySelector('[data-player-progress]');
        var bufferedBar = player.querySelector('[data-player-buffered]');
        var handle = player.querySelector('[data-player-timeline-handle]');
        var timeDurationEls = player.querySelectorAll('[data-player-time-duration]');
        var timeProgressEls = player.querySelectorAll('[data-player-time-progress]');

        var updateSize = player.getAttribute('data-player-update-size');
        var lazyMode = player.getAttribute('data-player-lazy');
        var isLazyTrue = lazyMode === 'true';
        var isLazyMeta = lazyMode === 'meta';
        var autoplay = player.getAttribute('data-player-autoplay') === 'true';
        var initialMuted = player.getAttribute('data-player-muted') === 'true';
        var pendingPlay = false;

        if (autoplay) {
          setMutedState(true);
          video.loop = true;
        } else {
          setMutedState(initialMuted);
        }

        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.playsInline = true;
        if (typeof video.disableRemotePlayback !== 'undefined') {
          video.disableRemotePlayback = true;
        }
        if (autoplay) {
          video.autoplay = false;
        }

        var isSafariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
        var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

        if (updateSize === 'true' && !isLazyMeta) {
          if (!isLazyTrue) {
            var previousPreload = video.preload;
            video.preload = 'metadata';
            var onMeta = function () {
              setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
              video.removeEventListener('loadedmetadata', onMeta);
              video.preload = previousPreload || '';
            };
            video.addEventListener('loadedmetadata', onMeta, { once: true });
            video.src = src;
          }
        }

        function fetchMetaOnce() {
          getSourceMeta(src, canUseHlsJs).then(function (meta) {
            if (meta.width && meta.height) {
              setBeforeRatio(player, updateSize, meta.width, meta.height);
            }
            if (timeDurationEls.length && isFinite(meta.duration) && meta.duration > 0) {
              setText(timeDurationEls, formatTime(meta.duration));
            }
            readyIfIdle(player, pendingPlay);
          });
        }

        var isAttached = false;
        var lastPauseBy = '';

        function attachMediaOnce() {
          if (isAttached) return;
          isAttached = true;

          if (player._hls) {
            try {
              player._hls.destroy();
            } catch (_) {}
            player._hls = null;
          }

          if (isSafariNative) {
            video.preload = isLazyTrue || isLazyMeta ? 'auto' : video.preload;
            video.src = src;
            video.addEventListener(
              'loadedmetadata',
              function () {
                readyIfIdle(player, pendingPlay);
                if (updateSize === 'true') {
                  setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
                }
                if (timeDurationEls.length) {
                  setText(timeDurationEls, formatTime(video.duration));
                }
              },
              { once: true }
            );
          } else if (canUseHlsJs) {
            var hls = new Hls({ maxBufferLength: 10 });
            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
              hls.loadSource(src);
            });
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              readyIfIdle(player, pendingPlay);
              if (updateSize === 'true') {
                var levels = hls.levels || [];
                var best = bestLevel(levels);
                if (best && best.width && best.height) {
                  setBeforeRatio(player, updateSize, best.width, best.height);
                }
              }
            });
            hls.on(Hls.Events.LEVEL_LOADED, function (_, data) {
              if (data && data.details && isFinite(data.details.totalduration) && timeDurationEls.length) {
                setText(timeDurationEls, formatTime(data.details.totalduration));
              }
            });
            player._hls = hls;
          } else {
            video.src = src;
          }
        }

        if (isLazyMeta) {
          fetchMetaOnce();
          video.preload = 'none';
        } else if (isLazyTrue) {
          video.preload = 'none';
        } else {
          attachMediaOnce();
        }

        function togglePlay() {
          if (video.paused || video.ended) {
            if ((isLazyTrue || isLazyMeta) && !isAttached) {
              attachMediaOnce();
            }
            pendingPlay = true;
            lastPauseBy = '';
            setStatus('loading');
            safePlay(video);
            return;
          }

          lastPauseBy = 'manual';
          video.pause();
        }

        function toggleMute() {
          video.muted = !video.muted;
          player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
        }

        function isFullscreenActive() {
          return !!(document.fullscreenElement || document.webkitFullscreenElement);
        }

        function enterFullscreen() {
          if (player.requestFullscreen) return player.requestFullscreen();
          if (video.requestFullscreen) return video.requestFullscreen();
          if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') {
            return video.webkitEnterFullscreen();
          }
        }

        function exitFullscreen() {
          if (document.exitFullscreen) return document.exitFullscreen();
          if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
          if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') {
            return video.webkitExitFullscreen();
          }
        }

        function toggleFullscreen() {
          if (isFullscreenActive() || video.webkitDisplayingFullscreen) {
            exitFullscreen();
            return;
          }
          enterFullscreen();
        }

        document.addEventListener('fullscreenchange', function () {
          setFullscreenState(isFullscreenActive());
        });
        document.addEventListener('webkitfullscreenchange', function () {
          setFullscreenState(isFullscreenActive());
        });
        video.addEventListener('webkitbeginfullscreen', function () {
          setFullscreenState(true);
        });
        video.addEventListener('webkitendfullscreen', function () {
          setFullscreenState(false);
        });

        player.addEventListener('click', function (event) {
          var button = event.target.closest('[data-player-control]');
          if (!button || !player.contains(button)) return;

          var type = button.getAttribute('data-player-control');
          if (type === 'play' || type === 'pause' || type === 'playpause') {
            togglePlay();
          } else if (type === 'mute') {
            toggleMute();
          } else if (type === 'fullscreen') {
            toggleFullscreen();
          }
        });

        function updateTimeTexts() {
          if (timeDurationEls.length) {
            setText(timeDurationEls, formatTime(video.duration));
          }
          if (timeProgressEls.length) {
            setText(timeProgressEls, formatTime(video.currentTime));
          }
        }

        video.addEventListener('timeupdate', updateTimeTexts);
        video.addEventListener('loadedmetadata', function () {
          updateTimeTexts();
          maybeSetRatioFromVideo(player, updateSize, video);
        });
        video.addEventListener('loadeddata', function () {
          maybeSetRatioFromVideo(player, updateSize, video);
        });
        video.addEventListener('playing', function () {
          maybeSetRatioFromVideo(player, updateSize, video);
        });
        video.addEventListener('durationchange', updateTimeTexts);

        var rafId;

        function updateProgressVisuals() {
          if (!video.duration) return;
          var playedPct = (video.currentTime / video.duration) * 100;
          if (progressBar) {
            progressBar.style.transform = 'translateX(' + (-100 + playedPct) + '%)';
          }
          if (handle) {
            handle.style.left = playedPct + '%';
          }
        }

        function loop() {
          updateProgressVisuals();
          if (!video.paused && !video.ended) {
            rafId = requestAnimationFrame(loop);
          }
        }

        function updateBufferedBar() {
          if (!bufferedBar || !video.duration || !video.buffered.length) return;
          var end = video.buffered.end(video.buffered.length - 1);
          var bufferedPct = (end / video.duration) * 100;
          bufferedBar.style.transform = 'translateX(' + (-100 + bufferedPct) + '%)';
        }

        video.addEventListener('progress', updateBufferedBar);
        video.addEventListener('loadedmetadata', updateBufferedBar);
        video.addEventListener('durationchange', updateBufferedBar);

        video.addEventListener('play', function () {
          setActivated(true);
          cancelAnimationFrame(rafId);
          loop();
          setStatus('playing');
        });
        video.addEventListener('playing', function () {
          pendingPlay = false;
          setStatus('playing');
        });
        video.addEventListener('pause', function () {
          pendingPlay = false;
          cancelAnimationFrame(rafId);
          updateProgressVisuals();
          setStatus('paused');
        });
        video.addEventListener('waiting', function () {
          setStatus('loading');
        });
        video.addEventListener('canplay', function () {
          readyIfIdle(player, pendingPlay);
        });
        video.addEventListener('ended', function () {
          pendingPlay = false;
          cancelAnimationFrame(rafId);
          updateProgressVisuals();
          setStatus('paused');
          setActivated(false);
        });

        if (timeline) {
          var dragging = false;
          var wasPlaying = false;
          var targetTime = 0;
          var lastSeekTs = 0;
          var seekThrottle = 180;
          var rect = null;

          window.addEventListener('resize', function () {
            if (!dragging) {
              rect = null;
            }
          });

          function getFractionFromX(x) {
            if (!rect) {
              rect = timeline.getBoundingClientRect();
            }
            var fraction = (x - rect.left) / rect.width;
            if (fraction < 0) fraction = 0;
            if (fraction > 1) fraction = 1;
            return fraction;
          }

          function previewAtFraction(fraction) {
            if (!video.duration) return;
            var pct = fraction * 100;
            if (progressBar) {
              progressBar.style.transform = 'translateX(' + (-100 + pct) + '%)';
            }
            if (handle) {
              handle.style.left = pct + '%';
            }
            if (timeProgressEls.length) {
              setText(timeProgressEls, formatTime(fraction * video.duration));
            }
          }

          function maybeSeek(now) {
            if (!video.duration || now - lastSeekTs < seekThrottle) return;
            lastSeekTs = now;
            video.currentTime = targetTime;
          }

          function onPointerDown(event) {
            if (!video.duration) return;
            dragging = true;
            wasPlaying = !video.paused && !video.ended;
            if (wasPlaying) {
              video.pause();
            }
            player.setAttribute('data-timeline-drag', 'true');
            rect = timeline.getBoundingClientRect();
            var fraction = getFractionFromX(event.clientX);
            targetTime = fraction * video.duration;
            previewAtFraction(fraction);
            maybeSeek(performance.now());
            if (timeline.setPointerCapture) {
              timeline.setPointerCapture(event.pointerId);
            }
            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', onPointerUp, { passive: true });
            event.preventDefault();
          }

          function onPointerMove(event) {
            if (!dragging) return;
            var fraction = getFractionFromX(event.clientX);
            targetTime = fraction * video.duration;
            previewAtFraction(fraction);
            maybeSeek(performance.now());
            event.preventDefault();
          }

          function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            player.setAttribute('data-timeline-drag', 'false');
            rect = null;
            video.currentTime = targetTime;
            if (wasPlaying) {
              safePlay(video);
            } else {
              updateProgressVisuals();
              updateTimeTexts();
            }
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
          }

          timeline.addEventListener('pointerdown', onPointerDown, { passive: false });
          if (handle) {
            handle.addEventListener('pointerdown', onPointerDown, { passive: false });
          }
        }

        var hoverTimer;
        var hoverHideDelay = 3000;

        function setHover(state) {
          if (player.getAttribute('data-player-hover') !== state) {
            player.setAttribute('data-player-hover', state);
          }
        }

        function scheduleHide() {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(function () {
            setHover('idle');
          }, hoverHideDelay);
        }

        function wakeControls() {
          setHover('active');
          scheduleHide();
        }

        player.addEventListener('pointerdown', wakeControls);
        document.addEventListener('fullscreenchange', wakeControls);
        document.addEventListener('webkitfullscreenchange', wakeControls);

        var trackingMove = false;

        function onPointerMoveGlobal(event) {
          var bounds = player.getBoundingClientRect();
          if (
            event.clientX >= bounds.left &&
            event.clientX <= bounds.right &&
            event.clientY >= bounds.top &&
            event.clientY <= bounds.bottom
          ) {
            wakeControls();
          }
        }

        player.addEventListener('pointerenter', function () {
          wakeControls();
          if (!trackingMove) {
            trackingMove = true;
            window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true });
          }
        });
        player.addEventListener('pointerleave', function () {
          setHover('idle');
          clearTimeout(hoverTimer);
          if (trackingMove) {
            trackingMove = false;
            window.removeEventListener('pointermove', onPointerMoveGlobal);
          }
        });

        if (autoplay) {
          var observer = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                var inView = entry.isIntersecting && entry.intersectionRatio > 0;
                if (inView) {
                  if ((isLazyTrue || isLazyMeta) && !isAttached) {
                    attachMediaOnce();
                  }

                  if (video.paused) {
                    lastPauseBy = '';
                    pendingPlay = true;
                    setStatus('loading');
                    safePlay(video);
                  } else {
                    setStatus('playing');
                  }
                  return;
                }

                if (!video.paused && !video.ended) {
                  lastPauseBy = 'io';
                  video.pause();
                  setStatus('paused');
                }
              });
            },
            { threshold: 0.1 }
          );

          observer.observe(player);
        }

        if (!autoplay && lastPauseBy !== 'manual') {
          readyIfIdle(player, pendingPlay);
        }
      });
  }

  function pad2(num) {
    return (num < 10 ? '0' : '') + num;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    var totalSeconds = Math.floor(seconds);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var remainder = totalSeconds % 60;
    return hours > 0
      ? hours + ':' + pad2(minutes) + ':' + pad2(remainder)
      : pad2(minutes) + ':' + pad2(remainder);
  }

  function setText(nodes, text) {
    nodes.forEach(function (node) {
      node.textContent = text;
    });
  }

  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function (currentBest, level) {
      return (level.width || 0) > (currentBest.width || 0) ? level : currentBest;
    }, levels[0]);
  }

  function safePlay(video) {
    var promise = video.play();
    if (promise && typeof promise.then === 'function') {
      promise.catch(function () {});
    }
  }

  function readyIfIdle(player, pendingPlay) {
    if (
      !pendingPlay &&
      player.getAttribute('data-player-activated') !== 'true' &&
      player.getAttribute('data-player-status') === 'idle'
    ) {
      player.setAttribute('data-player-status', 'ready');
    }
  }

  function setBeforeRatio(player, updateSize, width, height) {
    if (updateSize !== 'true' || !width || !height) return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    before.style.paddingTop = (height / width) * 100 + '%';
  }

  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    var hasPadding = before.style.paddingTop && before.style.paddingTop !== '0%';
    if (!hasPadding && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  function resolveUrl(base, relative) {
    try {
      return new URL(relative, base).toString();
    } catch (_) {
      return relative;
    }
  }

  function getSourceMeta(src, useHlsJs) {
    return new Promise(function (resolve) {
      if (useHlsJs && window.Hls && Hls.isSupported()) {
        try {
          var tmp = new Hls();
          var output = { width: 0, height: 0, duration: NaN };

          tmp.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
            var levels = (data && data.levels) || tmp.levels || [];
            var best = bestLevel(levels);
            if (best && best.width && best.height) {
              output.width = best.width;
              output.height = best.height;
            }
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function (_, data) {
            if (data && data.details && isFinite(data.details.totalduration)) {
              output.duration = data.details.totalduration;
            }
          });
          tmp.on(Hls.Events.ERROR, function () {
            try {
              tmp.destroy();
            } catch (_) {}
            resolve(output);
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function () {
            try {
              tmp.destroy();
            } catch (_) {}
            resolve(output);
          });

          tmp.loadSource(src);
          return;
        } catch (_) {
          resolve({ width: 0, height: 0, duration: NaN });
          return;
        }
      }

      function parseMaster(masterText) {
        var lines = masterText.split(/\r?\n/);
        var bestW = 0;
        var bestH = 0;
        var firstMedia = null;
        var lastInf = null;

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('#EXT-X-STREAM-INF:') === 0) {
            lastInf = line;
          } else if (lastInf && line && line[0] !== '#') {
            if (!firstMedia) {
              firstMedia = line.trim();
            }
            var match = /RESOLUTION=(\d+)x(\d+)/.exec(lastInf);
            if (match) {
              var width = parseInt(match[1], 10);
              var height = parseInt(match[2], 10);
              if (width > bestW) {
                bestW = width;
                bestH = height;
              }
            }
            lastInf = null;
          }
        }

        return { bestW: bestW, bestH: bestH, media: firstMedia };
      }

      function sumDuration(mediaText) {
        var duration = 0;
        var re = /#EXTINF:([\d.]+)/g;
        var match;
        while ((match = re.exec(mediaText))) {
          duration += parseFloat(match[1]);
        }
        return duration;
      }

      fetch(src, { credentials: 'omit', cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('master');
          return response.text();
        })
        .then(function (master) {
          var info = parseMaster(master);
          if (!info.media) {
            resolve({
              width: info.bestW || 0,
              height: info.bestH || 0,
              duration: NaN
            });
            return;
          }

          var mediaUrl = resolveUrl(src, info.media);
          return fetch(mediaUrl, { credentials: 'omit', cache: 'no-store' })
            .then(function (response) {
              if (!response.ok) throw new Error('media');
              return response.text();
            })
            .then(function (mediaText) {
              resolve({
                width: info.bestW || 0,
                height: info.bestH || 0,
                duration: sumDuration(mediaText)
              });
            });
        })
        .catch(function () {
          resolve({ width: 0, height: 0, duration: NaN });
        });
    });
  }

  window.RipeMediaPlayer = window.RipeMediaPlayer || {};
  window.RipeMediaPlayer.init = initBunnyPlayer;

  function autoInit() {
    initBunnyPlayer(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
