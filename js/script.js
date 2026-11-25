/* =========================================================
   H&N Senile Embroidery — interactions
   Theme toggle, mobile menu, galleries, scroll reveal, mailto form
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

  /* ---------- Galleries: only buttons / dots change the photo ----------
     Photos come from assets/gallery-data.js, which is generated
     from the "Work Sample" and "Environment" folders.              */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

      /* The whole visible photo is a link, so opening in a new tab
         always uses the photo that is actually on screen. */
      var link = document.createElement('a');
      link.className = 'gallery-image-link';
      link.href = photo.src;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Open ' + photo.alt + ' in a new tab');

      var img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      if (i > 0) img.loading = 'lazy';
      link.appendChild(img);

      var zoom = document.createElement('span');
      zoom.className = 'gallery-zoom';
      zoom.setAttribute('aria-hidden', 'true');
      zoom.textContent = 'View full size ↗';
      link.appendChild(zoom);

      slide.appendChild(link);
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

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Show image ' + (i + 1));
      dot.addEventListener('click', function () { show(i); });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
        /* Hidden slides must not catch clicks or keyboard focus. */
        slide.inert = !active;
        var link = slide.querySelector('.gallery-image-link');
        if (link) link.tabIndex = active ? 0 : -1;
      });
      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); });

    show(0);
  }

  var galleryData = window.HNS_GALLERY || {};
  document.querySelectorAll('.gallery').forEach(function (slider) {
    var key = slider.getAttribute('data-gallery');
    initGallery(slider, galleryData[key] || []);
  });

  /* ---------- Reveal each item once, the first time it scrolls into view ---------- */
  var revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    Array.prototype.forEach.call(revealItems, function (el, i) {
      el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
    });

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      Array.prototype.forEach.call(revealItems, function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* animate only once */
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
      Array.prototype.forEach.call(revealItems, function (el) { revealObserver.observe(el); });
    }
  }

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
