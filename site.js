// Frontend interactions: mobile nav, active-section highlight, publication hover preview.
(function () {
  'use strict';

  // ---- Mobile nav toggle ----
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    // Close menu after clicking a link (mobile)
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // ---- Active section highlight in nav ----
  var navAnchors = links ? links.querySelectorAll('a') : [];
  var sections = [];
  navAnchors.forEach(function (a) {
    var id = (a.getAttribute('href') || '').slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ id: id, el: sec, link: a });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            sections.forEach(function (s) {
              s.link.classList.toggle('active', s.el === entry.target);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s.el); });
  }

  // ---- Publication hover preview popover ----
  var preview = document.getElementById('pub-preview');
  var previewImg = preview ? preview.querySelector('img') : null;
  if (!preview || !previewImg) return;

  var activeThumb = null;

  function showPreview(thumb) {
    var src = thumb.getAttribute('data-preview');
    if (!src) return;
    activeThumb = thumb;
    previewImg.src = src;
    preview.classList.add('show');
  }
  function hidePreview() {
    activeThumb = null;
    preview.classList.remove('show');
  }
  function positionPreview(x, y) {
    if (!preview) return;
    var w = preview.offsetWidth;
    var h = preview.offsetHeight;
    var px = x + 20;
    var py = y + 20;
    if (px + w > window.innerWidth - 12) px = x - w - 20;
    if (py + h > window.innerHeight - 12) py = window.innerHeight - h - 12;
    if (px < 12) px = 12;
    if (py < 12) py = 12;
    preview.style.left = px + 'px';
    preview.style.top = py + 'px';
  }

  document.querySelectorAll('.pub-thumb').forEach(function (thumb) {
    thumb.addEventListener('mouseenter', function () { showPreview(thumb); });
    thumb.addEventListener('mouseleave', hidePreview);
    thumb.addEventListener('mousemove', function (e) {
      if (activeThumb === thumb) positionPreview(e.clientX, e.clientY);
    });
  });
})();
