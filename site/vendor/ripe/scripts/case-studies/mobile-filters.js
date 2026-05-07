function initMobileFilters() {
  var mq = window.matchMedia('(max-width: 767px)');
  var initialized = false;

  function setup() {
    if (initialized) return;
    initialized = true;
    doInit(mq.matches);
  }

  // Close modal and clean up when crossing to desktop
  mq.addEventListener('change', function (e) {
    if (!e.matches && initialized) {
      var formBlock = document.querySelector('.form-block');
      if (formBlock) {
        formBlock.classList.remove('is-open');
        formBlock.classList.remove('is-closing');
      }
      document.body.classList.remove('mobile-filters-open');
    }
    setup();
  });

  setup();
}

function doInit(enableMobileUi) {

  // Target the specific forms using precise selectors
  var gridFormEl = document.querySelector('.grid-switch .filters-and-sort');
  var formBlock = document.querySelector('.form-block');
  var filterList = formBlock && formBlock.querySelector('.filter-list');

  if (!gridFormEl || !formBlock || !filterList) return;

  // Verify this is the right form-block (the one with filters, not something else)
  if (!formBlock.querySelector('.filter-checkbox')) return;

  var checkboxes = Array.prototype.slice.call(
    formBlock.querySelectorAll('input[type="checkbox"]')
  );
  if (!checkboxes.length) return;

  var btnLabel = null;
  var allItem = null;
  var isResettingFilters = false;

  function dispatchFilterEvents(input) {
    if (!input) return;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function getCheckedCheckboxes() {
    return checkboxes.filter(function (cb) { return !!cb.checked; });
  }

  function getCheckboxLabel(input) {
    var option = input && input.closest ? input.closest('.filter-checkbox') : null;
    var label = option ? option.querySelector('.checkbox-label') : null;
    return label ? label.textContent.trim() : '';
  }

  function resetAllFilters() {
    if (isResettingFilters) return false;

    var changed = false;
    isResettingFilters = true;

    checkboxes.forEach(function (cb) {
      if (!cb.checked) return;
      cb.checked = false;
      dispatchFilterEvents(cb);
      changed = true;
    });

    isResettingFilters = false;
    updateState();
    return changed;
  }

  function collapseFullySelectedFilters() {
    if (isResettingFilters) return false;
    if (checkboxes.length === 0) return false;

    var checked = getCheckedCheckboxes();
    if (checked.length !== checkboxes.length) return false;

    resetAllFilters();
    return true;
  }

  function closeModal() {
    formBlock.classList.remove('is-open');
    formBlock.classList.add('is-closing');
    formBlock.addEventListener('animationend', function onEnd() {
      formBlock.classList.remove('is-closing');
      document.body.classList.remove('mobile-filters-open');
      formBlock.removeEventListener('animationend', onEnd);
    });
  }

  if (enableMobileUi) {
    // --- Inject CATEGORIES button into the grid form ---
    var btn = document.createElement('button');
    btn.className = 'mobile-categories-btn';
    btn.type = 'button';
    var btnIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
    btn.innerHTML = btnIcon + ' <span class="mobile-categories-label">CATEGORIES</span>';
    gridFormEl.insertBefore(btn, gridFormEl.firstChild);

    btnLabel = btn.querySelector('.mobile-categories-label');

    // --- Inject close button into form-block ---
    var closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-filter-close';
    closeBtn.type = 'button';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close filters');
    formBlock.insertBefore(closeBtn, formBlock.firstChild);

    // --- Inject "All" option at top of filter list ---
    allItem = document.createElement('div');
    allItem.className = 'mobile-filter-all is-active';
    allItem.textContent = 'All';
    filterList.insertBefore(allItem, filterList.firstChild);

    // --- Open modal ---
    btn.addEventListener('click', function () {
      formBlock.classList.add('is-open');
      document.body.classList.add('mobile-filters-open');
    });

    closeBtn.addEventListener('click', closeModal);

    // --- "All" click: reset all filters ---
    allItem.addEventListener('click', function () {
      resetAllFilters();
      updateState();
      setTimeout(closeModal, 200);
    });
  }

  // --- Update button label and "All" active state ---
  function updateState() {
    var activeFilters = getCheckedCheckboxes();
    var count = activeFilters.length;

    // Update "All" state
    if (allItem && count > 0) {
      allItem.classList.remove('is-active');
    } else if (allItem) {
      allItem.classList.add('is-active');
    }

    // Update button label
    if (!btnLabel) {
      return;
    }

    if (count === 0) {
      btnLabel.textContent = 'CATEGORIES';
    } else if (count === 1) {
      btnLabel.textContent = getCheckboxLabel(activeFilters[0]).toUpperCase() || 'CATEGORIES';
    } else {
      btnLabel.textContent = 'MULTIPLE';
    }
  }

  // Listen for checkbox changes
  checkboxes.forEach(function (cb) {
    cb.addEventListener('change', function () {
      setTimeout(function () {
        if (isResettingFilters) {
          updateState();
          return;
        }

        if (collapseFullySelectedFilters()) {
          return;
        }

        updateState();
      }, 50);
    });
  });

  // Observe Finsweet is-active class changes
  var filterCheckboxes = formBlock.querySelectorAll('.filter-checkbox');
  var observer = new MutationObserver(function () {
    updateState();
  });
  filterCheckboxes.forEach(function (el) {
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  updateState();

}

initMobileFilters();
