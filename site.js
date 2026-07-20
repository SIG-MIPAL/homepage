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

  // ---- Achievements card carousel (lab page) ----
  // Each .ach-carousel shows one .ach-card at a time; prev/next arrows, dot indicators, swipe, and
  // arrow-key navigation (when hovered) flip through the cards. No-op if there are no carousels.
  function initAchievementsCarousel() {
    var carousels = document.querySelectorAll('.ach-carousel');
    if (!carousels.length) return;
    var active = null;
    carousels.forEach(function (car) {
      var track = car.querySelector('.ach-track');
      var cards = car.querySelectorAll('.ach-card');
      var prev = car.querySelector('.ach-prev');
      var next = car.querySelector('.ach-next');
      var dots = car.querySelectorAll('.ach-dot');
      if (!track || !cards.length) return;
      var n = cards.length;
      if (n === 1) {
        if (prev) prev.style.display = 'none';
        if (next) next.style.display = 'none';
        var dotsWrap = car.querySelector('.ach-dots');
        if (dotsWrap) dotsWrap.style.display = 'none';
        return;
      }
      var idx = 0;
      function render() {
        track.style.transform = 'translateX(-' + (idx * 100) + '%)';
        dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      }
      function go(i) { idx = (i + n) % n; render(); }
      // Auto-advance: data-auto is the interval in seconds (set per group in the admin). Pauses
      // while the mouse hovers the carousel; resumes on leave. Manual nav resets the timer so the
      // user's pick is not immediately overridden.
      var autoSec = parseFloat(car.getAttribute('data-auto'));
      var timer = null;
      function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
      function startAuto() { stopAuto(); if (isFinite(autoSec) && autoSec > 0) { timer = setInterval(function () { go(idx + 1); }, autoSec * 1000); } }
      if (prev) prev.addEventListener('click', function () { go(idx - 1); startAuto(); });
      if (next) next.addEventListener('click', function () { go(idx + 1); startAuto(); });
      dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); startAuto(); }); });
      car.addEventListener('mouseenter', function () { active = car; stopAuto(); });
      car.addEventListener('mouseleave', function () { if (active === car) active = null; startAuto(); });
      var vp = car.querySelector('.ach-viewport');
      if (vp) {
        var sx = 0, tracking = false;
        vp.addEventListener('touchstart', function (e) {
          if (e.touches.length === 1) { sx = e.touches[0].clientX; tracking = true; }
        }, { passive: true });
        vp.addEventListener('touchend', function (e) {
          if (!tracking) return; tracking = false;
          var dx = (e.changedTouches[0] ? e.changedTouches[0].clientX : sx) - sx;
          if (Math.abs(dx) > 40) { if (dx < 0) go(idx + 1); else go(idx - 1); startAuto(); }
        });
      }
      render();
      startAuto();
    });
    if (!window._achKeyBound) {
      window._achKeyBound = true;
      document.addEventListener('keydown', function (e) {
        if (!active) return;
        if (e.key === 'ArrowLeft') { var p = active.querySelector('.ach-prev'); if (p) p.click(); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { var nx = active.querySelector('.ach-next'); if (nx) nx.click(); e.preventDefault(); }
      });
    }
  }
  initAchievementsCarousel();

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
