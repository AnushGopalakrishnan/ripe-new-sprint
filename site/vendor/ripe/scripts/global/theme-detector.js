(function () {
  function findCurrentScript() {
    if (document.currentScript && document.currentScript.src) {
      return document.currentScript;
    }

    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && /\/scripts\/global\/theme-detector\.js(?:\?.*)?$/.test(scripts[i].src)) {
        return scripts[i];
      }
    }

    return null;
  }

  function loadClassPickerIfNeeded() {
    var params = new URLSearchParams(window.location.search);
    if (!params.get("dev") || window.__ripeClassPickerInit) {
      return;
    }

    var currentScript = findCurrentScript();
    if (!currentScript || !currentScript.src) return;

    var base = currentScript.src.replace(/\/scripts\/global\/theme-detector\.js(?:\?.*)?$/, "");
    if (!base) return;

    var script = document.createElement("script");
    script.src = base + "/scripts/global/class-picker.js";
    document.head.appendChild(script);
  }

  function initCheckSectionThemeScroll() {
    var navBarHeight = document.querySelector("[data-nav-bar-height]");
    var themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

    function checkThemeSection() {
      var themeSections = document.querySelectorAll("[data-theme-section]");
      themeSections.forEach(function (themeSection) {
        var rect = themeSection.getBoundingClientRect();
        var themeSectionTop = rect.top;
        var themeSectionBottom = rect.bottom;

        if (
          themeSectionTop <= themeObserverOffset &&
          themeSectionBottom >= themeObserverOffset
        ) {
          // Site-wide theme (light/dark)
          var themeSectionActive =
            themeSection.getAttribute("data-theme-section");
          document
            .querySelectorAll("[data-site-theme]")
            .forEach(function (elem) {
              if (elem.getAttribute("data-site-theme") !== themeSectionActive) {
                elem.setAttribute("data-site-theme", themeSectionActive);
              }
            });

          // Site-wide background
          var bgSectionActive = themeSection.getAttribute("data-bg-section");
          document
            .querySelectorAll("[data-site-bg]")
            .forEach(function (elem) {
              if (elem.getAttribute("data-site-bg") !== bgSectionActive) {
                elem.setAttribute("data-site-bg", bgSectionActive);
              }
            });
        }
      });
    }

    function startThemeCheck() {
      document.addEventListener("scroll", checkThemeSection);
    }

    checkThemeSection();
    startThemeCheck();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCheckSectionThemeScroll);
  } else {
    initCheckSectionThemeScroll();
  }

  loadClassPickerIfNeeded();
})();
