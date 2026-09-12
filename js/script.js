// ==========================================================================
// Shared behaviour across all pages
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile tab-bar toggle ---- */
  const menuToggle = document.getElementById('menuToggle');
  const tabs = document.getElementById('tabs');
  if (menuToggle && tabs) {
    menuToggle.addEventListener('click', () => {
      tabs.classList.toggle('open');
    });
    tabs.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => tabs.classList.remove('open'));
    });
  }

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Project carousel (with tech-stack filtering) ---- */
  const track = document.querySelector('.carousel-track');
  if (track) {
    const allSlides = Array.from(track.children);
    const dotsWrap = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const viewport = document.querySelector('.carousel-viewport');

    let visibleSlides = allSlides;
    let index = 0;
    let autoTimer;

    function buildDots() {
      dotsWrap.innerHTML = '';
      visibleSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i) {
      if (!visibleSlides.length) return;
      index = (i + visibleSlides.length) % visibleSlides.length;
      update();
      resetAuto();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    // Show/hide slides by their data-tech tags, then rebuild dots and reset
    // to the first visible slide so the index math stays in sync.
    function applyFilter(tech) {
      allSlides.forEach(slide => {
        const tags = (slide.dataset.tech || '').split(' ');
        const show = tech === 'all' || tags.includes(tech);
        slide.style.display = show ? '' : 'none';
      });
      visibleSlides = allSlides.filter(s => s.style.display !== 'none');
      index = 0;
      buildDots();
      update();
    }

    if (filterBtns.length) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyFilter(btn.dataset.filter);
        });
      });
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Clicking a slide (but not the arrows) opens the project link
    allSlides.forEach(slide => {
      slide.addEventListener('click', () => {
        const url = slide.getAttribute('data-url');
        if (url && url !== '#') window.open(url, '_blank', 'noopener');
      });
    });

    // Keyboard support
    document.querySelector('.carousel').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Touch swipe
    let startX = 0;
    viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
    }, { passive: true });

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 6000);
    }
    resetAuto();
    viewport.addEventListener('mouseenter', () => clearInterval(autoTimer));
    viewport.addEventListener('mouseleave', resetAuto);

    buildDots();
    update();
  }

  /* ---- Copy-to-clipboard for code/JSON blocks ---- */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-panel, .json-block');
      if (!block) return;

      // Clone so we can strip the header/button and turn <br> into real
      // newlines before reading textContent, without touching the live DOM.
      const clone = block.cloneNode(true);
      clone.querySelectorAll('.copy-btn, .code-panel-head').forEach(el => el.remove());
      clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      const text = clone.textContent.replace(/\n{3,}/g, '\n\n').trim();

      navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        btn.classList.add('copied');
        icon.className = 'fa-solid fa-check';
        setTimeout(() => {
          btn.classList.remove('copied');
          icon.className = originalClass;
        }, 1500);
      }).catch(() => {
        // Clipboard API can fail on non-HTTPS/non-localhost origins — fail quietly.
      });
    });
  });

  /* ---- Multi-currency toggle (Services page) ----
     One shared `currentCurrency` drives three things on the page:
     the .price-tag amounts on each service card, the cost estimator
     (checkboxes + running total), and the small retainer-price mention
     inside the estimator's note. All of them read their numbers from
     data-price-ngn / data-price-gbp attributes, so this stays a single
     source of truth per element instead of separate hardcoded strings. */
  const currencyToggle = document.querySelector('.currency-toggle');
  if (currencyToggle) {
    const CURRENCY_KEY = 'preferredCurrency';
    const SYMBOLS = { NGN: '₦', GBP: '£' };
    const FORMATTERS = {
      NGN: new Intl.NumberFormat('en-NG'),
      GBP: new Intl.NumberFormat('en-GB'),
    };

    const currencyBtns = currencyToggle.querySelectorAll('.currency-btn');
    const priceTags = document.querySelectorAll('.price-tag[data-price-ngn]');
    const estimatorInputs = document.querySelectorAll('#estimator input[data-price-ngn]');
    const estimatorTotalEl = document.getElementById('estimatorTotal');
    const retainerNoteEl = document.querySelector('.retainer-note-amount');

    function priceOf(el, currency) {
      return Number(currency === 'GBP' ? el.dataset.priceGbp : el.dataset.priceNgn);
    }
    function formatAmount(value, currency) {
      return SYMBOLS[currency] + FORMATTERS[currency].format(value);
    }

    function recalcEstimate(currency) {
      if (!estimatorTotalEl) return;
      let total = 0;
      estimatorInputs.forEach(input => {
        if (input.checked) total += priceOf(input, currency);
      });
      estimatorTotalEl.textContent = formatAmount(total, currency);
    }

    function applyCurrency(currency) {
      currencyBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.currency === currency));

      priceTags.forEach(tag => {
        const amountEl = tag.querySelector('.amount');
        if (amountEl) amountEl.textContent = formatAmount(priceOf(tag, currency), currency);
      });

      estimatorInputs.forEach(input => {
        const amountEl = input.closest('.estimator-option').querySelector('.option-amount');
        if (amountEl) amountEl.textContent = formatAmount(priceOf(input, currency), currency);
      });

      if (retainerNoteEl) {
        retainerNoteEl.textContent = formatAmount(priceOf(retainerNoteEl, currency), currency) + '/mo';
      }

      recalcEstimate(currency);
      localStorage.setItem(CURRENCY_KEY, currency);
    }

    currencyBtns.forEach(btn => {
      btn.addEventListener('click', () => applyCurrency(btn.dataset.currency));
    });
    estimatorInputs.forEach(input => {
      input.addEventListener('change', () => {
        const active = currencyToggle.querySelector('.currency-btn.active');
        recalcEstimate(active ? active.dataset.currency : 'NGN');
      });
    });

    // Default to NGN. If the visitor picked a currency on a previous visit,
    // localStorage wins; otherwise a light timezone heuristic guesses
    // whether they're likely browsing from outside Nigeria. This is a rough
    // signal, not real geolocation — there's no IP lookup in a static
    // vanilla-JS site, so it only ever adjusts the *default*, never
    // overrides an explicit choice.
    function detectDefaultCurrency() {
      const saved = localStorage.getItem(CURRENCY_KEY);
      if (saved === 'NGN' || saved === 'GBP') return saved;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz && tz !== 'Africa/Lagos' && (tz.startsWith('Europe/') || tz === 'GB')) return 'GBP';
      } catch (e) { /* Intl not available — fall through to default */ }
      return 'NGN';
    }

    applyCurrency(detectDefaultCurrency());
  }

  /* ---- Contact form -> opens the visitor's mail client ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value;
      const email = document.getElementById('cf-email').value;
      const message = document.getElementById('cf-message').value;
      const to = 'chukwuemekaojomah@gmail.com';
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }
});
