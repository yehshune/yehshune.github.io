// yehshune.github.io 共用互動：分段頁籤、實機檢視台、GSAP 同步滾動敘事、文件目錄與燈箱
(() => {
  const prefersReduced = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 分段頁籤共用控制（單一選中膠囊語法 + 方向鍵支援） */
  function initTabStrip(strip, onChange) {
    const buttons = [...strip.querySelectorAll('[data-tab]')];
    if (!buttons.length) return null;

    const select = (btn) => {
      buttons.forEach((b) => {
        const isTarget = b === btn;
        if (b.hasAttribute('aria-selected')) b.setAttribute('aria-selected', String(isTarget));
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', String(isTarget));
      });
      if (onChange) onChange(btn);
    };

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => select(btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const nextIdx = e.key === 'ArrowRight'
          ? (idx + 1) % buttons.length
          : (idx - 1 + buttons.length) % buttons.length;
        buttons[nextIdx].focus();
        select(buttons[nextIdx]);
      });
    });

    const initial =
      buttons.find((b) => b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-pressed') === 'true') || buttons[0];
    if (initial && onChange) onChange(initial);

    return { select };
  }

  /* 2. 首頁實機機能檢視台（左實機畫面 + 右說明側欄） */
  function initWorkbench() {
    const root = document.querySelector('[data-workbench]');
    if (!root) return;
    const strip = root.querySelector('.tab-strip');
    const img = root.querySelector('[data-wb-img]');
    const kicker = root.querySelector('[data-wb-kicker]');
    const title = root.querySelector('[data-wb-title]');
    const desc = root.querySelector('[data-wb-desc]');
    const meta = root.querySelector('[data-wb-meta]');
    const status = root.querySelector('[data-wb-status]');
    const link = root.querySelector('[data-wb-link]');
    if (!strip || !img) return;

    const applyTab = (btn, immediate) => {
      const src = btn.dataset.src;
      const alt = btn.dataset.alt || '';
      const badge = btn.dataset.status || '';
      const kText = btn.dataset.kicker || '';
      const tText = btn.dataset.title || '';
      const dText = btn.dataset.desc || '';
      const mList = (btn.dataset.meta || '').split('|').filter(Boolean);
      const href = btn.dataset.href || 'poexd/';

      if (status && badge) status.textContent = badge;
      if (kicker) kicker.textContent = kText;
      if (title) title.textContent = tText;
      if (desc) desc.textContent = dText;
      if (link) link.href = href;
      if (meta) {
        meta.replaceChildren(...mList.map((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          return li;
        }));
      }

      if (img.getAttribute('src') === src) return;
      if (immediate || prefersReduced()) {
        img.src = src;
        img.alt = alt;
        return;
      }
      img.classList.add('is-switching');
      const loader = new Image();
      loader.onload = () => {
        img.src = src;
        img.alt = alt;
        requestAnimationFrame(() => img.classList.remove('is-switching'));
      };
      loader.onerror = () => {
        img.src = src;
        img.alt = alt;
        img.classList.remove('is-switching');
      };
      loader.src = src;
    };

    let initialized = false;
    initTabStrip(strip, (btn) => {
      applyTab(btn, !initialized);
      initialized = true;
    });
  }

  /* 3. 首頁 GSAP + ScrollTrigger 同步滾動敘事與區塊出場 */
  function initHomepageMotion() {
    const stage = document.querySelector('#workflow');
    if (!stage) return;

    const steps = [...stage.querySelectorAll('.n-step')];
    const afterLayer = stage.querySelector('.transform-layer-after');
    const consoleLayer = stage.querySelector('.transform-layer-console');
    const divider = stage.querySelector('.transform-divider');
    const rail = stage.querySelector('.narrative-rail');
    const phaseLabel = stage.querySelector('[data-narrative-phase]');

    const phaseMeta = [
      'PHASE 01 / 國際服原文市集畫面',
      'PHASE 02 / 台服漢化、P/S 詞綴分階與通貨換算',
      'PHASE 03 / 線上搜尋主控台集中監聽多組查詢'
    ];

    const setStepVisual = (idx) => {
      steps.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      if (phaseLabel) phaseLabel.textContent = phaseMeta[idx] || phaseMeta[0];
      if (!afterLayer || !consoleLayer || !divider || !rail) return;

      if (idx === 0) {
        afterLayer.style.clipPath = 'inset(0 0 0 100%)';
        divider.style.left = '100%';
        divider.style.opacity = '0';
        consoleLayer.style.opacity = '0';
        consoleLayer.style.transform = 'scale(1.03)';
        rail.style.transform = 'scaleY(0.33)';
      } else if (idx === 1) {
        afterLayer.style.clipPath = 'inset(0 0 0 0%)';
        divider.style.left = '0%';
        divider.style.opacity = '0';
        consoleLayer.style.opacity = '0';
        consoleLayer.style.transform = 'scale(1.03)';
        rail.style.transform = 'scaleY(0.68)';
      } else {
        afterLayer.style.clipPath = 'inset(0 0 0 0%)';
        divider.style.left = '0%';
        divider.style.opacity = '0';
        consoleLayer.style.opacity = '1';
        consoleLayer.style.transform = 'scale(1)';
        rail.style.transform = 'scaleY(1)';
      }
    };

    let activeScrollTrigger = null;

    steps.forEach((step, idx) => {
      step.addEventListener('click', () => {
        if (activeScrollTrigger) {
          const targets = [0.1, 0.52, 0.9];
          const y = activeScrollTrigger.start + (activeScrollTrigger.end - activeScrollTrigger.start) * targets[idx];
          window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
        } else {
          setStepVisual(idx);
        }
      });
    });

    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      setStepVisual(1);
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-stage .hero-kicker, .hero-stage h1, .hero-stage .hero-subrow', {
        y: 12,
        duration: 0.42,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'transform'
      });

      gsap.utils.toArray('.js-section-enter').forEach((sec) => {
        gsap.from(sec, {
          y: 20,
          scale: 0.994,
          duration: 0.5,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: sec,
            start: 'top 88%',
            once: true
          }
        });
      });

      gsap.utils.toArray('.principle').forEach((item, i) => {
        gsap.from(item, {
          y: 14,
          duration: 0.42,
          delay: i * 0.05,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            once: true
          }
        });
      });

      // 全舞台同步釘選，scrub: true 零延遲與文字狀態嚴格 1:1 對應
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.narrative-pin',
          pin: true,
          scrub: true,
          start: 'top 76px',
          end: '+=720',
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const active = p < 0.32 ? 0 : p < 0.70 ? 1 : 2;
            steps.forEach((el, i) => el.classList.toggle('is-active', i === active));
            if (phaseLabel) phaseLabel.textContent = phaseMeta[active];
          }
        }
      });
      activeScrollTrigger = tl.scrollTrigger;

      // 0.00-0.24 停在 PHASE 01 | 0.24-0.40 掃過漢化層 | 0.40-0.64 停在 PHASE 02 | 0.64-0.78 切入主控台 | 0.78-1.00 停在 PHASE 03
      tl.set(rail, { scaleY: 0.33 }, 0)
        .set(afterLayer, { clipPath: 'inset(0 0 0 100%)' }, 0)
        .set(divider, { left: '100%', opacity: 0 }, 0)
        .set(consoleLayer, { opacity: 0, scale: 1.03 }, 0)
        .to(divider, { opacity: 1, duration: 0.03 }, 0.22)
        .to(rail, { scaleY: 0.68, duration: 0.16, ease: 'none' }, 0.24)
        .to(afterLayer, { clipPath: 'inset(0 0 0 0%)', duration: 0.16, ease: 'none' }, 0.24)
        .to(divider, { left: '0%', duration: 0.16, ease: 'none' }, 0.24)
        .to(divider, { opacity: 0, duration: 0.04 }, 0.38)
        .to(rail, { scaleY: 1, duration: 0.14, ease: 'none' }, 0.64)
        .to(consoleLayer, { opacity: 1, scale: 1, duration: 0.14, ease: 'none' }, 0.64)
        .to({}, { duration: 0.22 }, 0.78);

      return () => {
        activeScrollTrigger = null;
        setStepVisual(1);
      };
    });

    mm.add('(max-width: 959px), (prefers-reduced-motion: reduce)', () => {
      setStepVisual(1);
    });
  }

  /* 4. 教學頁側邊目錄高亮與閱讀進度條 */
  function initGuideToc() {
    const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
    const progressBar = document.getElementById('toc-progress-bar');
    const docEl = document.querySelector('.doc');
    if (!tocLinks.length) return;

    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));

    if ('IntersectionObserver' in window) {
      const tocObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          tocLinks.forEach((a) => a.classList.remove('active'));
          byId.get(entry.target.id)?.classList.add('active');
        }
      }, { rootMargin: '-84px 0px -68% 0px' });

      byId.forEach((_, id) => {
        const section = document.getElementById(id);
        if (section) tocObserver.observe(section);
      });
    }

    if (progressBar && docEl) {
      const updateProgress = () => {
        const rect = docEl.getBoundingClientRect();
        const total = Math.max(1, docEl.offsetHeight - window.innerHeight * 0.6);
        const passed = Math.min(total, Math.max(0, -rect.top + 120));
        progressBar.style.transform = `scaleX(${(passed / total).toFixed(4)})`;
      };
      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress, { passive: true });
    }
  }

  /* 5. 教學頁安裝分頁切換 */
  function initInstallTabs() {
    const box = document.querySelector('[data-install-tabs]');
    if (!box) return;
    const strip = box.querySelector('.tab-strip');
    const panels = [...box.querySelectorAll('[data-install-panel]')];
    if (!strip || !panels.length) return;

    initTabStrip(strip, (btn) => {
      const target = btn.dataset.tab;
      panels.forEach((p) => {
        p.hidden = p.dataset.installPanel !== target;
      });
    });
  }

  /* 6. 教學頁市集漢化前後互動比對（左：漢化前英文／右：漢化後台服繁中） */
  function initCompare() {
    const root = document.querySelector('[data-compare]');
    if (!root) return;
    const pairGrid = root.querySelector('.compare-pair-grid');
    const wipeWrap = root.querySelector('.compare-wipe-wrap');
    const afterWrap = root.querySelector('.compare-after-wrap');
    const handle = root.querySelector('.compare-handle');
    const range = root.querySelector('input[type="range"]');
    const strip = root.querySelector('.tab-strip');
    const pctText = root.querySelector('[data-compare-pct]');
    if (!afterWrap || !handle || !range) return;

    const setSplit = (val) => {
      const v = Math.min(100, Math.max(0, Number(val)));
      range.value = String(v);
      // 左側 0..v% 露出底層漢化前（英文），右側 v%..100% 露出上層漢化後（中文）
      afterWrap.style.clipPath = `inset(0 0 0 ${v}%)`;
      handle.style.left = `${v}%`;
      handle.style.opacity = v === 0 || v === 100 ? '0' : '1';
      if (pctText) pctText.textContent = `${v}%`;
    };

    const setMode = (mode) => {
      const isPair = mode === 'pair';
      if (pairGrid) pairGrid.hidden = !isPair;
      if (wipeWrap) wipeWrap.hidden = isPair;
      if (mode === 'split') setSplit(50);
      else if (mode === 'en') setSplit(100);
      else if (mode === 'zh') setSplit(0);
      if (pctText && isPair) pctText.textContent = '並排檢視';
    };

    range.addEventListener('input', () => setSplit(range.value));

    if (strip) {
      initTabStrip(strip, (btn) => setMode(btn.dataset.tab));
    } else {
      setMode('pair');
    }
  }

  /* 7. 共用燈箱（截圖與 QR Code 點擊放大） */
  function initLightbox() {
    let dialog = document.getElementById('site-lightbox');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'site-lightbox';
      dialog.className = 'lightbox';
      dialog.hidden = true;
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'site-lightbox-cap');
      dialog.innerHTML = `
        <div class="lightbox-box">
          <div class="lightbox-media" id="site-lightbox-media"></div>
          <div class="lightbox-bar">
            <p class="lightbox-cap" id="site-lightbox-cap"></p>
            <button type="button" class="lightbox-close" id="site-lightbox-close">關閉 (Esc)</button>
          </div>
        </div>`;
      document.body.appendChild(dialog);
    }

    const box = dialog.querySelector('.lightbox-box');
    const media = dialog.querySelector('#site-lightbox-media');
    const cap = dialog.querySelector('#site-lightbox-cap');
    const closeBtn = dialog.querySelector('#site-lightbox-close');
    let lastTrigger = null;

    const close = () => {
      dialog.hidden = true;
      media.replaceChildren();
      document.body.style.overflow = '';
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      lastTrigger = null;
    };

    const open = (trigger) => {
      const src = trigger.dataset.lightboxSrc;
      if (!src) return;
      lastTrigger = trigger;
      box.classList.toggle('is-qr', trigger.dataset.lightboxMode === 'qr');
      const img = document.createElement('img');
      img.src = src;
      img.alt = trigger.dataset.lightboxAlt || '';
      media.replaceChildren(img);
      cap.textContent = trigger.dataset.lightboxCaption || '';
      dialog.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lightbox-src]');
      if (trigger) {
        e.preventDefault();
        open(trigger);
        return;
      }
      if (e.target === dialog || e.target === closeBtn) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dialog.hidden) close();
    });
  }

  window.__yehshuneUI = { initTabStrip };

  document.addEventListener('DOMContentLoaded', () => {
    initWorkbench();
    initHomepageMotion();
    initGuideToc();
    initInstallTabs();
    initCompare();
    initLightbox();
  });
})();
