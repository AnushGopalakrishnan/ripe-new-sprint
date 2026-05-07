window.Webflow ||= [];
window.Webflow.push(() => {
  const grid = document.querySelector(".masonry-list");
  if (!grid) {
    console.warn("❌ .masonry-list not found");
    return;
  }

  // INIT ISOTOPE
  window.iso = new Isotope(grid, {
    itemSelector: ".masonry-item",
    layoutMode: "masonry",
    masonry: {
      columnWidth: ".masonry-item",
      gutter: 128, // desktop default
    },
    transitionDuration: "0.3s",
  });

  // Initial layout
  // window.iso.layout();
  imagesLoaded(grid, () => {
    // Force a clean first layout AFTER images load
    window.iso.reloadItems();
    window.iso.layout();
    console.log("codesandbox");
  });

  // ----- RESPONSIVE GUTTER + COLUMNS
  const updateLayoutOptions = () => {
    const w = window.innerWidth;

    if (w <= 767) {
      // Mobile: 2 columns, 24px gutter
      window.iso.options.masonry.gutter = 24;
    } else if (w <= 991) {
      // Tablet: 2 columns, 64px gutter
      window.iso.options.masonry.gutter = 64;
    } else {
      // Desktop
      window.iso.options.masonry.gutter = 128;
    }
  };

  // ----- RELAYOUT FUNCTION (single source of truth)
  let raf = null;
  const relayout = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      updateLayoutOptions();
      window.iso.reloadItems();
      window.iso.layout();
    });
  };

  // ----- PRIMARY: Finsweet render event
  document.addEventListener("fs-list-rendered", () => {
    requestAnimationFrame(relayout);
  });

  // ----- FALLBACK: MutationObserver (safe + minimal)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (
        m.type === "attributes" &&
        (m.attributeName === "style" || m.attributeName === "class")
      ) {
        relayout();
        break;
      }
    }
  });

  observer.observe(grid, {
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  // ----- HANDLE RESIZE
  window.addEventListener("resize", relayout);
});
