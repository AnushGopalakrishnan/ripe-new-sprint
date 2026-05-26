export const bridgeScript = String.raw`
(() => {
  if (window.__RIPE_EDITOR_BRIDGE__) return;
  window.__RIPE_EDITOR_BRIDGE__ = true;

  let enabled = true;
  let hoverTarget = null;
  let selectedTarget = null;
  let redrawFrame = 0;
  const previews = new Map();
  const hoverBox = document.createElement("div");
  const selectBox = document.createElement("div");

  const selectionPurple = "#7c3aed";

  function mountBox(box, variant, zIndex) {
    const selected = variant === "selected";
    Object.assign(box.style, {
      position: "fixed",
      pointerEvents: "none",
      background: selected ? "transparent" : "rgba(124,58,237,0.045)",
      border: selected ? "1.5px solid " + selectionPurple : "1px dashed rgba(124,58,237,0.86)",
      borderRadius: "2px",
      boxShadow: selected
        ? "0 0 0 1px rgba(255,255,255,0.96), 0 0 0 4px rgba(124,58,237,0.14)"
        : "0 0 0 1px rgba(255,255,255,0.86), 0 0 0 3px rgba(124,58,237,0.08)",
      boxSizing: "border-box",
      zIndex,
      display: "none",
      transition: "none",
    });

    if (selected) {
      const handles = [
        { left: "0%", top: "0%", transform: "translate(-50%, -50%)" },
        { left: "50%", top: "0%", transform: "translate(-50%, -50%)" },
        { left: "100%", top: "0%", transform: "translate(-50%, -50%)" },
        { left: "100%", top: "50%", transform: "translate(-50%, -50%)" },
        { left: "100%", top: "100%", transform: "translate(-50%, -50%)" },
        { left: "50%", top: "100%", transform: "translate(-50%, -50%)" },
        { left: "0%", top: "100%", transform: "translate(-50%, -50%)" },
        { left: "0%", top: "50%", transform: "translate(-50%, -50%)" },
      ];

      for (const position of handles) {
        const handle = document.createElement("span");
        Object.assign(handle.style, {
          position: "absolute",
          width: "7px",
          height: "7px",
          background: "#ffffff",
          border: "1.5px solid " + selectionPurple,
          borderRadius: "2px",
          boxShadow: "0 1px 2px rgba(20,16,38,0.18)",
          boxSizing: "border-box",
          ...position,
        });
        box.appendChild(handle);
      }
    }

    document.documentElement.appendChild(box);
  }

  function cssEscape(value) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\\\$&");
  }

  function route() {
    return window.location.pathname.replace(/^\/__mirror/, "") || "/";
  }

  function isEditableControl(element) {
    return Boolean(
      element.closest("input, textarea, select, option, [contenteditable='true'], [contenteditable='']")
    );
  }

  function inspectableControlFor(element) {
    return element.closest("button, a[href], [role='button']");
  }

  function selectableElementFrom(target) {
    const element = target instanceof Element ? target : null;
    if (!element || element === hoverBox || element === selectBox || isEditableControl(element)) return null;

    const control = inspectableControlFor(element);
    if (control && control !== document.body && control !== document.documentElement) return control;

    return element;
  }

  function stopPageAction(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
  }

  function nthOfType(element) {
    let index = 1;
    let node = element;
    while ((node = node.previousElementSibling)) {
      if (node.tagName === element.tagName) index += 1;
    }
    return index;
  }

  function selectorFor(element) {
    if (element.id) return "#" + cssEscape(element.id);

    const attrs = ["data-w-id", "data-wf--navbar--variant", "data-site-theme", "aria-label"];
    for (const attr of attrs) {
      const value = element.getAttribute(attr);
      if (value) return element.tagName.toLowerCase() + "[" + attr + "='" + String(value).replace(/'/g, "\\\\'") + "']";
    }

    const parts = [];
    let node = element;
    while (node && node.nodeType === 1 && parts.length < 4 && node !== document.body) {
      const tag = node.tagName.toLowerCase();
      const className = Array.from(node.classList).filter(Boolean).slice(0, 3).map(cssEscape).join(".");
      parts.unshift(tag + (className ? "." + className : "") + ":nth-of-type(" + nthOfType(node) + ")");
      node = node.parentElement;
    }
    return parts.join(" > ");
  }

  function targetFor(element) {
    const dataAttrs = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith("data-")) dataAttrs[attr.name] = attr.value;
    }

    const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();

    return {
      route: route(),
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      dataAttrs,
      classes: Array.from(element.classList).filter(Boolean),
      nthOfType: nthOfType(element),
      selector: selectorFor(element),
      textSnippet: text ? text.slice(0, 160) : undefined,
    };
  }

  function findByTarget(target) {
    if (!target) return null;
    if (target.id) {
      const byId = document.getElementById(target.id);
      if (byId) return byId;
    }
    try {
      const selected = document.querySelector(target.selector);
      if (selected) return selected;
    } catch {}
    return null;
  }

  function toCssProperty(property) {
    return String(property).replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
  }

  function draw(box, element) {
    if (!element || !enabled) {
      box.style.display = "none";
      return;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      box.style.display = "none";
      return;
    }
    Object.assign(box.style, {
      display: "block",
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });
  }

  function drawTarget(box, target) {
    draw(box, findByTarget(target));
  }

  function redrawBoxes() {
    redrawFrame = 0;
    drawTarget(hoverBox, hoverTarget);
    drawTarget(selectBox, selectedTarget);
  }

  function scheduleRedraw() {
    if (redrawFrame) return;
    redrawFrame = window.requestAnimationFrame(redrawBoxes);
  }

  function selectionFor(element) {
    const computed = window.getComputedStyle(element);
    const props = [
      "display",
      "position",
      "width",
      "maxWidth",
      "height",
      "gap",
      "alignItems",
      "justifyContent",
      "margin",
      "padding",
      "fontSize",
      "lineHeight",
      "letterSpacing",
      "fontWeight",
      "textAlign",
      "color",
      "backgroundColor",
      "borderRadius",
      "opacity",
      "visibility",
    ];
    const computedStyles = {};
    for (const prop of props) computedStyles[prop] = computed[prop] || "";

    return {
      route: route(),
      target: targetFor(element),
      text: element instanceof HTMLImageElement ? "" : (element.textContent || "").trim(),
      imageSrc: element instanceof HTMLImageElement ? element.currentSrc || element.src : "",
      computedStyles,
    };
  }

  function post(message) {
    window.parent.postMessage(message, window.location.origin);
  }

  function onPointerMove(event) {
    if (!enabled) return;
    const element = selectableElementFrom(event.target);
    if (!element) return;
    hoverTarget = targetFor(element);
    draw(hoverBox, element);
    post({ type: "editor:hover", target: hoverTarget });
  }

  function onPointerDown(event) {
    if (!enabled) return;
    const element = selectableElementFrom(event.target);
    if (!element || !inspectableControlFor(element)) return;
    stopPageAction(event);
    selectedTarget = targetFor(element);
    draw(selectBox, element);
    post({ type: "editor:select", selection: selectionFor(element) });
  }

  function onClick(event) {
    if (!enabled) return;
    const element = selectableElementFrom(event.target);
    if (!element) return;
    stopPageAction(event);
    selectedTarget = targetFor(element);
    draw(selectBox, element);
    post({ type: "editor:select", selection: selectionFor(element) });
  }

  function applyPreview(payload) {
    const element = findByTarget(payload && payload.target);
    if (!element) return;
    const previous = previews.get(payload.target.selector) || {
      style: element.getAttribute("style"),
      html: element instanceof HTMLImageElement ? null : element.innerHTML,
      src: element instanceof HTMLImageElement ? element.getAttribute("src") : null,
    };
    previews.set(payload.target.selector, previous);

    if (payload.styles) {
      for (const [property, value] of Object.entries(payload.styles)) {
        const cssProperty = toCssProperty(property);
        if (value) element.style.setProperty(cssProperty, value, "important");
        else element.style.removeProperty(cssProperty);
      }
    }
    if (typeof payload.hidden === "boolean") {
      if (payload.hidden) element.style.setProperty("visibility", "hidden", "important");
      else element.style.removeProperty("visibility");
    }
    if (typeof payload.text === "string" && !(element instanceof HTMLImageElement)) {
      element.textContent = payload.text;
    }
    if (typeof payload.imageSrc === "string" && element instanceof HTMLImageElement) {
      element.setAttribute("src", payload.imageSrc);
      element.removeAttribute("srcset");
    }
    draw(selectBox, element);
    scheduleRedraw();
  }

  function clearPreview(target) {
    const entries = target ? [[target.selector, previews.get(target.selector)]] : Array.from(previews.entries());
    for (const [selector, previous] of entries) {
      if (!previous) continue;
      const element = findByTarget({ selector });
      if (!element) continue;
      if (previous.style === null) element.removeAttribute("style");
      else element.setAttribute("style", previous.style);
      if (previous.html !== null && !(element instanceof HTMLImageElement)) element.innerHTML = previous.html;
      if (previous.src !== null && element instanceof HTMLImageElement) element.setAttribute("src", previous.src);
      previews.delete(selector);
    }
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    const message = event.data || {};
    if (message.type === "editor:apply-preview") applyPreview(message.patch);
    if (message.type === "editor:clear-preview") clearPreview(message.target);
    if (message.type === "editor:set-enabled") {
      enabled = Boolean(message.enabled);
      if (!enabled) {
        hoverBox.style.display = "none";
        selectBox.style.display = "none";
      } else {
        scheduleRedraw();
      }
    }
    if (message.type === "editor:request-dom") {
      post({ type: "editor:dom", title: document.title, route: route() });
    }
  });

  mountBox(hoverBox, "hover", "2147483645");
  mountBox(selectBox, "selected", "2147483646");
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("scroll", scheduleRedraw, true);
  window.addEventListener("resize", scheduleRedraw);
  window.visualViewport?.addEventListener("scroll", scheduleRedraw);
  window.visualViewport?.addEventListener("resize", scheduleRedraw);
})();
`;
