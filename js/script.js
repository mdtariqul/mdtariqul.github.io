/* =========================================================
   H&N Senile Embroidery — interactions
   Theme toggle, mobile menu, auto gallery, mailto form
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Theme switch ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'dark' ? '#131417' : '#9b1b3a');
    }
  }

  applyTheme(root.getAttribute('data-theme') || 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('hns-theme', next); } catch (e) {}
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primary-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---------- Auto-swapping galleries ----------
     Photos come from assets/gallery-data.js, which is generated
     from the files in assets/images/work and /environment.        */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var INTERVAL = 4500;

  function initGallery(slider, photos) {
    var track = slider.querySelector('.gallery-track');
    var dotsBox = slider.querySelector('.gallery-dots');
    var prevBtn = slider.querySelector('.gallery-nav.prev');
    var nextBtn = slider.querySelector('.gallery-nav.next');
    if (!track || !dotsBox) return;

    /* Build the slides from the photo list — no HTML editing needed. */
    track.innerHTML = '';
    dotsBox.innerHTML = '';
    photos.forEach(function (photo, i) {
      var slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      var img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      if (i > 0) img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
    });

    var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    if (!slides.length) {
      track.innerHTML = '<p class="gallery-empty">No photos yet — add images to this gallery folder.</p>';
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      return;
    }

    var dots = [];
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Show image ' + (i + 1));
      dot.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function start() {
      if (reduceMotion.matches || slides.length < 2) return;
      timer = window.setInterval(function () { show(current + 1); }, INTERVAL);
    }

    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    function restart() { stop(); start(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); restart(); });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', restart);
    }

    show(0);
    start();
  }

  var galleryData = window.HNS_GALLERY || {};
  document.querySelectorAll('.gallery').forEach(function (slider) {
    var key = slider.getAttribute('data-gallery');
    initGallery(slider, galleryData[key] || []);
  });

  /* ---------- Mailto contact form (no backend) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var subject = form.elements.subject.value.trim() || 'Embroidery inquiry';
      var message = form.elements.message.value.trim();
      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      window.location.href = 'mailto:hnemb1982@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- Footer year + years of craft ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var yearsExp = document.getElementById('yearsExp');
  if (yearsExp) {
    yearsExp.textContent = Math.max(0, new Date().getFullYear() - 2019) + '+';
  }

  /* ---------- Highlight current section in nav ---------- */
  if ('IntersectionObserver' in window && nav) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
  }
})();
