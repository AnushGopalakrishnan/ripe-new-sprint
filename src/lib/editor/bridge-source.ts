export const bridgeScript = String.raw`
(() => {
  if (window.__RIPE_EDITOR_BRIDGE__) return;
  window.__RIPE_EDITOR_BRIDGE__ = true;

  let enabled = true;
  let hoverTarget = null;
  let selectedSelections = [];
  let redrawFrame = 0;
  const previews = new Map();
  const hoverBox = document.createElement("div");
  const selectBoxes = new Map();

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

    box.dataset.ripeEditorBox = "true";
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
      element && element.closest("input, textarea, select, option, [contenteditable='true'], [contenteditable='']")
    );
  }

  function editableControlFor(element) {
    const control = element && element.closest("input, textarea, select, option, [contenteditable='true'], [contenteditable='']");
    if (!control) return null;
    if (control.tagName && control.tagName.toLowerCase() === "option") return control.closest("select") || control;
    return control;
  }

  function inspectableControlFor(element) {
    return element.closest("button, a[href], [role='button'], input, textarea, select, [contenteditable='true'], [contenteditable='']");
  }

  function numericCssValue(value) {
    const parsed = Number.parseFloat(String(value || ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function hasVisibleRadius(style) {
    return [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ].some((value) => numericCssValue(value) > 0);
  }

  function clipsChildren(style) {
    return [style.overflow, style.overflowX, style.overflowY].some((value) => value === "hidden" || value === "clip");
  }

  function editableImageFor(element) {
    if (element instanceof HTMLImageElement) return element;
    if (!element || !(element instanceof Element)) return null;

    const images = Array.from(element.querySelectorAll("img"));
    return images.length === 1 ? images[0] : null;
  }

  function visualMediaFrameFor(element) {
    const mediaElement = element instanceof HTMLImageElement || element instanceof HTMLVideoElement ? element : null;
    if (!mediaElement) return null;

    let node = mediaElement.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const style = window.getComputedStyle(node);
      const mediaChildren = node.querySelectorAll("img, video, picture");

      if (mediaChildren.length === 1 && mediaChildren[0] === mediaElement && hasVisibleRadius(style) && clipsChildren(style)) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  function selectableElementFrom(target) {
    const element = target instanceof Element ? target : null;
    if (!element || element.closest("[data-ripe-editor-box]")) return null;

    const editableControl = editableControlFor(element);
    if (editableControl && editableControl !== document.body && editableControl !== document.documentElement) {
      return editableControl;
    }

    const control = inspectableControlFor(element);
    if (control && control !== document.body && control !== document.documentElement) return control;

    const visualMediaFrame = visualMediaFrameFor(element);
    if (visualMediaFrame) return visualMediaFrame;

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
    function isUnique(selector) {
      try {
        const matches = document.querySelectorAll(selector);
        return matches.length === 1 && matches[0] === element;
      } catch {
        return false;
      }
    }

    if (element.id) {
      const byId = "#" + cssEscape(element.id);
      if (isUnique(byId)) return byId;
    }

    const attrs = ["data-w-id", "data-wf--navbar--variant", "data-site-theme", "aria-label"];
    for (const attr of attrs) {
      const value = element.getAttribute(attr);
      if (value) {
        const selector = element.tagName.toLowerCase() + "[" + attr + "='" + String(value).replace(/'/g, "\\\\'") + "']";
        if (isUnique(selector)) return selector;
      }
    }

    const parts = [];
    let node = element;
    let fallback = "";
    while (node && node.nodeType === 1 && node !== document.body) {
      const tag = node.tagName.toLowerCase();
      const className = Array.from(node.classList).filter(Boolean).slice(0, 3).map(cssEscape).join(".");
      parts.unshift(tag + (className ? "." + className : "") + ":nth-of-type(" + nthOfType(node) + ")");
      fallback = parts.join(" > ");
      if (isUnique(fallback)) return fallback;
      node = node.parentElement;
    }
    return fallback;
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

  function elementForSelection(selection) {
    return findByTarget(selection && selection.target);
  }

  function isSelectableCandidate(element) {
    return Boolean(
      element &&
        element instanceof Element &&
        element !== document.body &&
        element !== document.documentElement &&
        !element.closest("[data-ripe-editor-box]")
    );
  }

  function immediateSelectableChildren(element) {
    if (!element) return [];
    return Array.from(element.children).filter(isSelectableCandidate);
  }

  function immediateSelectableParent(element) {
    const parent = element && element.parentElement;
    return isSelectableCandidate(parent) ? parent : null;
  }

  function dedupeElementsInDomOrder(elements) {
    const seen = new Set();
    const unique = [];
    for (const element of elements) {
      const selector = selectorFor(element);
      if (seen.has(selector)) continue;
      seen.add(selector);
      unique.push(element);
    }
    return unique.sort((left, right) => {
      if (left === right) return 0;
      const position = left.compareDocumentPosition(right);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
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

  function sameTarget(left, right) {
    return Boolean(left && right && left.selector === right.selector && left.route === right.route);
  }

  function ensureSelectBox(key) {
    const existing = selectBoxes.get(key);
    if (existing) return existing;
    const box = document.createElement("div");
    mountBox(box, "selected", "2147483646");
    selectBoxes.set(key, box);
    return box;
  }

  function syncSelectBoxes() {
    const activeKeys = new Set(selectedSelections.map((selection) => selection.target.selector));

    for (const [key, box] of selectBoxes.entries()) {
      if (activeKeys.has(key)) continue;
      box.remove();
      selectBoxes.delete(key);
    }

    for (const selection of selectedSelections) {
      drawTarget(ensureSelectBox(selection.target.selector), selection.target);
    }
  }

  function redrawBoxes() {
    redrawFrame = 0;
    drawTarget(hoverBox, hoverTarget);
    syncSelectBoxes();
  }

  function scheduleRedraw() {
    if (redrawFrame) return;
    redrawFrame = window.requestAnimationFrame(redrawBoxes);
  }

  function selectionFor(element) {
    const computed = window.getComputedStyle(element);
    const selector = selectorFor(element);
    const editable = isEditableControl(element);
    const editableImage = editableImageFor(element);
    const textEditable =
      !editable &&
      !editableImage &&
      !(element instanceof HTMLImageElement) &&
      !(element instanceof HTMLPictureElement) &&
      !(element instanceof HTMLVideoElement) &&
      !(element instanceof SVGElement) &&
      element.children.length === 0;
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
      "fontFamily",
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
      text: textEditable ? (element.textContent || "").trim() : "",
      imageSrc: editableImage ? editableImage.currentSrc || editableImage.src : "",
      computedStyles,
      capabilities: {
        canEditText: textEditable,
        canEditImage: Boolean(editableImage),
        isEditableControl: editable,
        selectorUnique: (() => {
          try {
            const matches = document.querySelectorAll(selector);
            return matches.length === 1 && matches[0] === element;
          } catch {
            return false;
          }
        })(),
      },
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

  function updateSelection(element, additive) {
    const nextSelection = selectionFor(element);
    if (additive) {
      const exists = selectedSelections.some((selection) => sameTarget(selection.target, nextSelection.target));
      selectedSelections = exists
        ? selectedSelections.filter((selection) => !sameTarget(selection.target, nextSelection.target))
        : [...selectedSelections, nextSelection];
      if (selectedSelections.length === 0) selectedSelections = [nextSelection];
    } else {
      selectedSelections = [nextSelection];
    }

    syncSelectBoxes();
    post({
      type: "editor:select",
      selection: selectedSelections[0],
      selections: selectedSelections,
    });
  }

  function replaceSelection(elements) {
    const nextElements = dedupeElementsInDomOrder(elements);
    if (nextElements.length === 0) return;

    selectedSelections = nextElements.map(selectionFor);
    syncSelectBoxes();
    post({
      type: "editor:select",
      selection: selectedSelections[0],
      selections: selectedSelections,
    });
  }

  function navigateSelectionHierarchy(direction) {
    if (selectedSelections.length === 0) return false;

    const currentElements = selectedSelections.map(elementForSelection).filter(Boolean);
    const nextElements =
      direction === "children"
        ? currentElements.flatMap(immediateSelectableChildren)
        : currentElements.map(immediateSelectableParent).filter(Boolean);

    const uniqueElements = dedupeElementsInDomOrder(nextElements);
    if (uniqueElements.length === 0) return false;
    replaceSelection(uniqueElements);
    return true;
  }

  function onPointerDown(event) {
    if (!enabled) return;
    const element = selectableElementFrom(event.target);
    if (!element || !inspectableControlFor(element)) return;
    stopPageAction(event);
    updateSelection(element, event.shiftKey || event.metaKey || event.ctrlKey);
  }

  function onClick(event) {
    if (!enabled) return;
    const element = selectableElementFrom(event.target);
    if (!element) return;
    stopPageAction(event);
    updateSelection(element, event.shiftKey || event.metaKey || event.ctrlKey);
  }

  function onKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isEditableControl(event.target instanceof Element ? event.target : null)
    ) {
      const handled = navigateSelectionHierarchy(event.shiftKey ? "parent" : "children");
      if (handled) stopPageAction(event);
      return;
    }

    if (!(event.metaKey || event.ctrlKey)) return;
    const key = String(event.key || "").toLowerCase();
    if (key !== "z" && key !== "y") return;

    stopPageAction(event);
    if (key === "z" && event.shiftKey) post({ type: "editor:redo" });
    else if (key === "z") post({ type: "editor:undo" });
    else post({ type: "editor:redo" });
  }

  function applyPreview(payload) {
    const element = findByTarget(payload && payload.target);
    if (!element) return;
    const editableImage = editableImageFor(element);
    const existingPreview = previews.get(payload.target.selector);
    const previous = existingPreview || {
      style: element.getAttribute("style"),
      text: typeof payload.text === "string" && !(element instanceof HTMLImageElement) ? element.textContent : null,
      src: editableImage ? editableImage.getAttribute("src") : null,
      srcset: editableImage ? editableImage.getAttribute("srcset") : null,
    };
    if (
      existingPreview &&
      typeof payload.text === "string" &&
      previous.text === null &&
      !(element instanceof HTMLImageElement)
    ) {
      previous.text = element.textContent;
    }
    previews.set(payload.target.selector, previous);

    if (existingPreview) {
      restorePreviewElement(element, previous);
    }

    if (payload.styles) {
      for (const [property, value] of Object.entries(payload.styles)) {
        const cssProperty = toCssProperty(property);
        if (value) element.style.setProperty(cssProperty, value, "important");
        else element.style.removeProperty(cssProperty);
      }
      if (
        Object.prototype.hasOwnProperty.call(payload.styles, "width") &&
        payload.styles.width &&
        !Object.prototype.hasOwnProperty.call(payload.styles, "maxWidth")
      ) {
        element.style.setProperty("max-width", "none", "important");
      }
    }
    if (typeof payload.hidden === "boolean") {
      if (payload.hidden) element.style.setProperty("visibility", "hidden", "important");
      else if (!payload.styles || !Object.prototype.hasOwnProperty.call(payload.styles, "visibility")) {
        element.style.removeProperty("visibility");
      }
    }
    if (typeof payload.deleted === "boolean") {
      if (payload.deleted) element.style.setProperty("display", "none", "important");
      else if (!payload.styles || !Object.prototype.hasOwnProperty.call(payload.styles, "display")) {
        element.style.removeProperty("display");
      }
    }
    if (typeof payload.text === "string" && !(element instanceof HTMLImageElement)) {
      element.textContent = payload.text;
    }
    if (typeof payload.imageSrc === "string" && editableImage) {
      editableImage.setAttribute("src", payload.imageSrc);
      editableImage.removeAttribute("srcset");
    }
    scheduleRedraw();
  }

  function restorePreviewElement(element, previous) {
    if (previous.style === null) element.removeAttribute("style");
    else element.setAttribute("style", previous.style);
    if (previous.text !== null && !(element instanceof HTMLImageElement)) element.textContent = previous.text;
    if (element instanceof HTMLImageElement) {
      if (previous.src === null) element.removeAttribute("src");
      else element.setAttribute("src", previous.src);
      if (previous.srcset === null) element.removeAttribute("srcset");
      else element.setAttribute("srcset", previous.srcset);
    }
  }

  function clearPreview(target) {
    const entries = target ? [[target.selector, previews.get(target.selector)]] : Array.from(previews.entries());
    for (const [selector, previous] of entries) {
      if (!previous) continue;
      const element = findByTarget({ selector });
      if (!element) continue;
      restorePreviewElement(element, previous);
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
        for (const box of selectBoxes.values()) box.style.display = "none";
      } else {
        scheduleRedraw();
      }
    }
    if (message.type === "editor:request-dom") {
      post({ type: "editor:dom", title: document.title, route: route() });
    }
  });

  mountBox(hoverBox, "hover", "2147483645");
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("scroll", scheduleRedraw, true);
  window.addEventListener("resize", scheduleRedraw);
  window.visualViewport?.addEventListener("scroll", scheduleRedraw);
  window.visualViewport?.addEventListener("resize", scheduleRedraw);
})();
`;
