/* Navbar integration for the locally vendored liquidGL WebGL renderer. */
(function () {
  'use strict';

  const nav = document.querySelector('nav[data-liquid-nav]');
  const menu = document.getElementById('primary-nav-links');
  const navLensSelector = '.nav-liquid-lens';
  const menuLensSelector = '.menu-liquid-lens';

  if (!nav) return;

  let navInstance = null;
  let menuInstance = null;
  let highlightFrame = 0;
  let toneFrame = 0;
  let watchdog = 0;
  let snapshotRecoveryTimer = 0;

  function setStatus(element, status, reason) {
    element.dataset.liquidStatus = status;
    if (reason) {
      element.dataset.liquidReason = reason;
    } else {
      delete element.dataset.liquidReason;
    }
  }

  function useFallback(reason) {
    nav.classList.remove('liquid-glass-ready');
    setStatus(nav, 'fallback', reason);
    document.documentElement.dataset.liquidEngine = 'css';
    const rendererCanvas = window.__liquidGLRenderer__?.canvas;
    if (rendererCanvas) rendererCanvas.style.opacity = '0';
  }

  function hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      );
    } catch (error) {
      return false;
    }
  }

  function updateHighlight(event) {
    const point = { x: event.clientX, y: event.clientY };
    if (highlightFrame) return;

    highlightFrame = requestAnimationFrame(() => {
      highlightFrame = 0;
      const rect = nav.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(100, ((point.x - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((point.y - rect.top) / rect.height) * 100));
      nav.style.setProperty('--glass-x', `${x.toFixed(1)}%`);
      nav.style.setProperty('--glass-y', `${y.toFixed(1)}%`);
    });
  }

  function backgroundLuminance(element) {
    let current = element;
    while (current && current !== document.documentElement) {
      const color = getComputedStyle(current).backgroundColor;
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        const [red, green, blue, alpha = 1] = values;
        if (alpha > 0.12) {
          const channel = (value) => {
            const normalized = value / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : Math.pow((normalized + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
        }
      }
      current = current.parentElement;
    }
    return null;
  }

  function backgroundAt(x, y) {
    return document.elementsFromPoint(x, y).find((element) => {
      if (nav.contains(element)) return false;
      if (element.matches('[data-liquid-ignore], [data-liquid-ignore] *')) return false;
      return element.tagName !== 'CANVAS';
    });
  }

  function updateMaterialTone() {
    toneFrame = 0;
    const rect = nav.getBoundingClientRect();
    const probeY = Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2));
    const samples = [0.12, 0.3, 0.5, 0.7, 0.88]
      .map((position) => backgroundAt(
        Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width * position)),
        probeY
      ))
      .filter(Boolean);
    const richBackground = samples.some((element) => element.closest('.hero, footer'));
    const darkBackground = !richBackground && samples.some((element) => {
      const luminance = backgroundLuminance(element);
      return luminance !== null && luminance < 0.32;
    });
    const tone = richBackground ? 'clear' : darkBackground ? 'contrast' : 'regular';
    const profiles = {
      clear: { refraction: 0.007, bevelDepth: 0.026, frost: 0.2, magnify: 1.004 },
      regular: { refraction: 0.0018, bevelDepth: 0.008, frost: 1, magnify: 1 },
      contrast: { refraction: 0.0008, bevelDepth: 0.004, frost: 1.8, magnify: 1 }
    };
    nav.dataset.liquidTone = tone;

    if (navInstance?.options) {
      Object.assign(navInstance.options, profiles[tone]);
    }
  }

  function scheduleToneUpdate() {
    if (toneFrame) return;
    toneFrame = requestAnimationFrame(updateMaterialTone);
  }

  function recoverInitialSnapshot(attempt = 0) {
    if (nav.dataset.liquidStatus === 'ready' || attempt >= 40) return;

    const renderer = window.__liquidGLRenderer__;
    if (!renderer || renderer._capturing) {
      snapshotRecoveryTimer = window.setTimeout(() => {
        recoverInitialSnapshot(attempt + 1);
      }, 250);
      return;
    }

    renderer.captureSnapshot();
  }

  function markNavReady() {
    clearTimeout(watchdog);
    clearTimeout(snapshotRecoveryTimer);
    nav.classList.add('liquid-glass-ready');
    setStatus(nav, 'ready');
    document.documentElement.dataset.liquidEngine = 'webgl';
    updateMaterialTone();

    const rendererCanvas = window.__liquidGLRenderer__?.canvas;
    rendererCanvas?.addEventListener('webglcontextlost', () => {
      useFallback('context-lost');
    }, { once: true });
  }

  function initMenuLens() {
    if (!menu || menuInstance || !menu.classList.contains('open')) return;
    if (nav.dataset.liquidStatus !== 'ready') return;

    requestAnimationFrame(() => {
      try {
        menuInstance = window.liquidGL({
          target: menuLensSelector,
          snapshot: 'body',
          refraction: 0.004,
          bevelDepth: 0.024,
          bevelWidth: 0.12,
          frost: 0.85,
          shadow: true,
          specular: true,
          reveal: 'none',
          tilt: false,
          magnify: 1.002,
          on: {
            init() {
              menu.classList.add('liquid-menu-ready');
              setStatus(menu, 'ready');
            }
          }
        });
      } catch (error) {
        setStatus(menu, 'fallback', 'initialization-failed');
        console.warn('Navbar menu is using its CSS glass fallback.', error);
      }
    });
  }

  function start() {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData === true;

    if (reducedMotion || saveData || !hasWebGL()) {
      useFallback(reducedMotion ? 'reduced-motion' : saveData ? 'save-data' : 'webgl-unavailable');
      return;
    }

    if (typeof window.html2canvas !== 'function' || typeof window.liquidGL !== 'function') {
      useFallback('dependency-unavailable');
      return;
    }

    setStatus(nav, 'loading');
    watchdog = window.setTimeout(() => {
      if (nav.dataset.liquidStatus !== 'ready') useFallback('initialization-timeout');
    }, 15000);

    try {
      navInstance = window.liquidGL({
        target: navLensSelector,
        snapshot: 'body',
        resolution: innerWidth <= 720 ? 0.7 : 0.9,
        refraction: 0.007,
        bevelDepth: 0.026,
        bevelWidth: 0.16,
        frost: 0.2,
        shadow: true,
        specular: true,
        reveal: 'none',
        tilt: false,
        magnify: 1.004,
        on: { init: markNavReady }
      });
      snapshotRecoveryTimer = window.setTimeout(recoverInitialSnapshot, 350);

      if (menu) {
        new MutationObserver(() => {
          if (menu.classList.contains('open')) initMenuLens();
        }).observe(menu, { attributes: true, attributeFilter: ['class'] });
        if (menu.classList.contains('open')) initMenuLens();
      }
    } catch (error) {
      clearTimeout(watchdog);
      useFallback('initialization-failed');
      console.warn('Navbar is using its CSS glass fallback.', error);
    }
  }

  nav.addEventListener('pointermove', updateHighlight, { passive: true });
  nav.addEventListener('pointerleave', () => {
    nav.style.removeProperty('--glass-x');
    nav.style.removeProperty('--glass-y');
  }, { passive: true });
  window.addEventListener('scroll', scheduleToneUpdate, { passive: true });
  window.addEventListener('resize', scheduleToneUpdate, { passive: true });

  window.navLiquidGlass = {
    get navInstance() { return navInstance; },
    get menuInstance() { return menuInstance; },
    refreshTone: updateMaterialTone
  };

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }
})();
