(function () {
  var page = document.getElementById('page');
  if (!page) return;
  var cfg = window.OM || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var raw = el.dataset.count;
    var target = raw === '4.900' ? 4900 : 12;
    var suffix = raw === '12+' ? '+' : '';
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / 1100);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = (raw === '4.900' ? v.toLocaleString('de-DE') : String(v)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }

  if (!reduce) {
    Array.prototype.slice.call(page.children, 1, -1).forEach(function (band) {
      if (getComputedStyle(band).position === 'fixed') return;
      var items = [];
      Array.prototype.forEach.call(band.querySelectorAll(':scope > div'), function (c) {
        var d = getComputedStyle(c).display;
        if (c.childElementCount >= 2 && (d === 'grid' || d === 'flex')) {
          items = items.concat(Array.prototype.slice.call(c.children));
        }
      });
      var targets = (items.length >= 2 && items.length <= 14) ? items : [band];
      targets.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = (i * 70) + 'ms';
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('on');
        if (e.target.dataset.count) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.02 });

    Array.prototype.forEach.call(page.querySelectorAll('.reveal'), function (el) { io.observe(el); });
    Array.prototype.forEach.call(page.querySelectorAll('span'), function (s) {
      var t = s.textContent.trim();
      if (t === '12+' || t === '4.900') { s.dataset.count = t; io.observe(s); }
    });
  }

  var hdr = document.querySelector('[data-nav]');
  if (hdr) {
    hdr.style.transition = 'background .28s ease, border-color .28s ease';
    var tintBg = cfg.mobile ? 'rgba(10,23,32,.42)' : 'rgba(255,255,255,.45)';
    var tintBorder = cfg.mobile ? 'rgba(255,255,255,.14)' : 'rgba(18,34,46,.08)';
    var texts = cfg.mobile
      ? hdr.querySelectorAll('a, span')
      : hdr.querySelectorAll('a:not([href$="termin"]), a:not([href$="termin"]) span');
    var call = hdr.querySelector('a[href^="tel:"]');
    function paint() {
      var on = window.scrollY > 20;
      hdr.style.background = on ? tintBg : 'transparent';
      hdr.style.borderBottomColor = on ? tintBorder : 'transparent';
      hdr.style.backdropFilter = on ? (cfg.mobile ? 'saturate(160%) blur(14px)' : 'saturate(180%) blur(14px)') : 'none';
      hdr.style.webkitBackdropFilter = hdr.style.backdropFilter;
      Array.prototype.forEach.call(texts, function (el) {
        if (!el.dataset.baseColor) el.dataset.baseColor = getComputedStyle(el).color;
        if (cfg.mobile && cfg.landing) el.style.color = '#ffffff';
        else if (cfg.mobile) el.style.color = on ? '#ffffff' : el.dataset.baseColor;
        else el.style.color = on ? el.dataset.baseColor : '#ffffff';
      });
      if (call && cfg.mobile) {
        call.style.color = '#ffffff';
        call.style.borderColor = 'rgba(255,255,255,.7)';
      }
    }
    paint();
    window.addEventListener('scroll', paint, { passive: true });
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-nav] a[href="#top"], [data-nav] a[href="#"]') : null;
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function jump() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || id === 'top') return;
    var el = document.getElementById(id);
    if (!el) return;
    var off = hdr ? hdr.getBoundingClientRect().height + 16 : 12;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off });
  }
  [60, 300, 900].forEach(function (t) { setTimeout(jump, t); });
  window.addEventListener('hashchange', jump);
})();
