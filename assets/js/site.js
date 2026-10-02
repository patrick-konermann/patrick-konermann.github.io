/*
 * Site script: collapsing top menu and sticky-footer spacing.
 * Replaces the template's large script bundle, which the site no longer needs.
 */
(function () {
  'use strict';

  var LARGE = 925; // px, matches $large in _sass/_themes.scss
  var body = document.body;
  var masthead = document.querySelector('.masthead');
  var footer = document.querySelector('.page__footer');
  var sidebar = document.querySelector('.sidebar');

  // Width of an element's content box (what jQuery's .width() returned)
  function contentWidth(el) {
    var cs = getComputedStyle(el);
    var w = el.getBoundingClientRect().width;
    if (cs.boxSizing === 'border-box') {
      w -= (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) +
           (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
    }
    return w;
  }

  /* ---- Priority-plus ("greedy") navigation ---- */
  var nav = document.getElementById('site-nav');
  var updateNav = function () {};

  if (nav) {
    var btn = nav.querySelector('button');
    var vlinks = nav.querySelector('.visible-links');
    var hlinks = nav.querySelector('.hidden-links');
    var tail = vlinks.querySelector('.persist.tail');
    var breaks = [];

    var available = function () {
      return btn.classList.contains('hidden')
        ? contentWidth(nav)
        : contentWidth(nav) - contentWidth(btn) - 30;
    };
    var removable = function () {
      return Array.prototype.filter.call(vlinks.children, function (li) {
        return !li.classList.contains('persist');
      });
    };

    updateNav = function () {
      var space = available();
      var items;

      if (contentWidth(vlinks) > space) {
        // The visible list overflows: move items into the dropdown
        while (contentWidth(vlinks) > space && (items = removable()).length > 0) {
          breaks.push(contentWidth(vlinks));
          hlinks.insertBefore(items[items.length - 1], hlinks.firstChild);
          space = available();
          btn.classList.remove('hidden');
        }
      } else {
        // There is room: move items back from the dropdown
        while (breaks.length > 0 && space > breaks[breaks.length - 1] && hlinks.firstElementChild) {
          if (tail) {
            vlinks.insertBefore(hlinks.firstElementChild, tail);
          } else {
            vlinks.appendChild(hlinks.firstElementChild);
          }
          breaks.pop();
        }
        if (breaks.length < 1) {
          btn.classList.add('hidden');
          btn.classList.remove('close');
          hlinks.classList.add('hidden');
        }
      }

      btn.setAttribute('count', breaks.length);

      // Keep body/sidebar top padding in sync with the masthead height
      var mastheadHeight = masthead.offsetHeight;
      body.style.paddingTop = mastheadHeight + 'px';
      if (sidebar) {
        sidebar.style.paddingTop = window.innerWidth >= LARGE ? mastheadHeight + 'px' : '';
      }
    };

    btn.addEventListener('click', function () {
      hlinks.classList.toggle('hidden');
      btn.classList.toggle('close');
    });
  }

  /* ---- Sticky footer: reserve room for the absolutely positioned footer ---- */
  function bumpFooter() {
    if (!footer) return;
    var cs = getComputedStyle(footer);
    body.style.paddingBottom = '0';
    body.style.marginBottom = (footer.offsetHeight +
      (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0)) + 'px';
  }

  function refresh() {
    updateNav();
    bumpFooter();
  }

  var timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(refresh, 100);
  });
  if (window.screen && screen.orientation) {
    screen.orientation.addEventListener('change', refresh);
  }
  window.addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh);
  }
  refresh();
})();
