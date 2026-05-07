function initGridListToggle() {
  var gridList = gridView && (
    gridView.querySelector('.case-studies-list[fs-list-element="list"]') ||
    gridView.querySelector('#masonry1') ||
    gridView.querySelector('[fs-list-element="list"]')
  );
  var listViewItems = document.querySelectorAll('.cases-list-view-row');
  var listContainer = document.querySelector('.preview-container');
  var listWrapper = document.querySelector('.cases_listview-wrapper');
  var gridView = document.querySelector('.case-studies-wrapper.is-grid');

  if (!gridList || !gridView || !listContainer || !listWrapper) return;

  var oldSelect = document.querySelector('.grid-toggle');
  var select = oldSelect.cloneNode(true);
  oldSelect.parentNode.replaceChild(select, oldSelect);

  // Hide items by default, only inline styles override
  var style = document.createElement('style');
  style.textContent = '.case-studies-list[fs-list-element="list"] > * { opacity: 0 !important; } .cases-list-view-row[data-filtered="true"] { opacity: 0 !important; }';
  document.head.appendChild(style);

  // Make grid items visible immediately on load
  Array.prototype.forEach.call(gridList.children, function(item) {
    item.style.setProperty('opacity', '1', 'important');
  });
  gridView.style.setProperty('opacity', '1', 'important');

  // Grid filter animation observer
  var gridObserver = new MutationObserver(function(mutations) {
    var added = [];
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) added.push(node);
      });
    });

    if (added.length > 0) {
      added.forEach(function(node) {
        node.style.setProperty('opacity', '0', 'important');
        node.style.setProperty('transform', 'translateY(30px)');
      });

      setTimeout(function() {
        added.forEach(function(node, i) {
          setTimeout(function() {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('transition', 'opacity 0.5s ease, transform 0.5s ease');
            node.style.setProperty('transform', 'translateY(0px)');
          }, i * 20);
        });
      }, 0);
    }

    setTimeout(syncListView, 50);
  });
  gridObserver.observe(gridList, { childList: true });

  // Sync list view with grid filter state
  function syncListView() {
    var visibleTitles = new Set();
    gridList.querySelectorAll(':scope > * .casestudy_title-text').forEach(function(el) {
      visibleTitles.add(el.textContent.trim());
    });

    listViewItems.forEach(function(item) {
      var heading = item.querySelector('.casestudy_title-text');
      if (heading) {
        item.dataset.filtered = visibleTitles.has(heading.textContent.trim()) ? 'true' : 'false';
      }
    });

    if (!listContainer.classList.contains('is-hidden')) {
      applySync(true);
    }
  }

  function applySync(animate) {
    var delay = 0;
    listViewItems.forEach(function(item) {
      if (item.dataset.filtered === 'false') {
        item.style.display = 'none';
        item.style.removeProperty('opacity');
        item.style.removeProperty('transform');
        item.style.removeProperty('transition');
      } else {
        item.style.display = '';
        if (animate) {
          item.style.setProperty('opacity', '0', 'important');
          item.style.setProperty('transform', 'translateY(20px)');
          (function(el, d) {
            setTimeout(function() {
              el.style.setProperty('opacity', '1', 'important');
              el.style.setProperty('transition', 'opacity 0.5s ease, transform 0.5s ease');
              el.style.setProperty('transform', 'translateY(0px)');
            }, d);
          })(item, delay);
          delay += 30;
        } else {
          item.style.setProperty('opacity', '1', 'important');
        }
      }
    });
  }

  // Initial sync without animation
  syncListView();
  listViewItems.forEach(function(item) {
    if (item.dataset.filtered !== 'false') {
      item.style.setProperty('opacity', '1', 'important');
    }
  });

  // Toggle between grid and list view
  select.addEventListener('change', function() {
    if (this.value === 'List') {
      gsap.to(gridView, { opacity: 0, duration: 0.3, onComplete: function() {
        gridView.style.display = 'none';
        listContainer.classList.remove('is-hidden');
        listWrapper.style.display = 'block';
        applySync(true);
        gsap.fromTo([listContainer, listWrapper], { opacity: 0 }, { opacity: 1, duration: 0.3 });
      }});
    } else {
      gsap.to([listContainer, listWrapper], { opacity: 0, duration: 0.3, onComplete: function() {
        listContainer.classList.add('is-hidden');
        listWrapper.style.display = 'none';
        gridView.style.display = 'block';
        gsap.fromTo(gridView, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      }});
    }
  });
}

initGridListToggle();
