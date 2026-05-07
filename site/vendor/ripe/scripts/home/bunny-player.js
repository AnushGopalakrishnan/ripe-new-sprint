(function () {
  'use strict';

  function initHomeBunnyPlayer() {
    if (!window.RipeMediaPlayer || typeof window.RipeMediaPlayer.init !== 'function') {
      console.warn('[Ripe Media Player] Shared runtime was not available on the home route.');
      return;
    }

    window.RipeMediaPlayer.init(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeBunnyPlayer);
  } else {
    initHomeBunnyPlayer();
  }
})();
