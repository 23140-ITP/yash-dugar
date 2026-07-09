/*
 * Rounded-rectangle refraction adapted from shuding/liquid-glass.
 * Copyright (c) 2025 Shu Ding. Licensed under the MIT License.
 * See shuding-liquid-glass.LICENSE.txt in this directory.
 */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const MAX_MAP_WIDTH = 960;
  const MAX_MAP_PIXELS = 72000;
  const instances = [];
  let nextId = 0;

  function smoothStep(a, b, value) {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function length(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  function roundedRectSDF(x, y, halfWidth, halfHeight, radius) {
    const qx = Math.abs(x) - halfWidth + radius;
    const qy = Math.abs(y) - halfHeight + radius;
    return Math.min(Math.max(qx, qy), 0) +
      length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
  }

  function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function getBorderRadius(element, width, height) {
    const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
    return Math.max(0, Math.min(radius, width / 2, height / 2));
  }

  class LiquidGlassSurface {
    constructor(element) {
      this.element = element;
      this.id = `navbar-liquid-glass-${++nextId}`;
      this.lastGeometry = '';
      this.renderFrame = 0;
      this.highlightFrame = 0;
      this.pendingPointer = null;
      this.createFilter();
      this.observe();
      this.scheduleRender();
    }

    createFilter() {
      this.svg = document.createElementNS(SVG_NS, 'svg');
      this.svg.setAttribute('width', '0');
      this.svg.setAttribute('height', '0');
      this.svg.setAttribute('aria-hidden', 'true');
      this.svg.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden';

      const defs = document.createElementNS(SVG_NS, 'defs');
      this.filter = document.createElementNS(SVG_NS, 'filter');
      this.filter.setAttribute('id', `${this.id}-filter`);
      this.filter.setAttribute('filterUnits', 'userSpaceOnUse');
      this.filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
      this.filter.setAttribute('color-interpolation-filters', 'sRGB');

      this.image = document.createElementNS(SVG_NS, 'feImage');
      this.image.setAttribute('x', '0');
      this.image.setAttribute('y', '0');
      this.image.setAttribute('preserveAspectRatio', 'none');
      this.image.setAttribute('result', `${this.id}-map`);

      this.displacement = document.createElementNS(SVG_NS, 'feDisplacementMap');
      this.displacement.setAttribute('in', 'SourceGraphic');
      this.displacement.setAttribute('in2', `${this.id}-map`);
      this.displacement.setAttribute('xChannelSelector', 'R');
      this.displacement.setAttribute('yChannelSelector', 'G');

      this.filter.append(this.image, this.displacement);
      defs.appendChild(this.filter);
      this.svg.appendChild(defs);
      document.body.appendChild(this.svg);

      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d', { willReadFrequently: false });
    }

    observe() {
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this.scheduleRender());
        this.resizeObserver.observe(this.element);
      } else {
        window.addEventListener('resize', () => this.scheduleRender(), { passive: true });
      }

      this.mutationObserver = new MutationObserver(() => this.scheduleRender());
      this.mutationObserver.observe(this.element, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.element.addEventListener('pointermove', (event) => this.updateHighlight(event), { passive: true });
        this.element.addEventListener('pointerleave', () => {
          this.element.style.removeProperty('--glass-x');
          this.element.style.removeProperty('--glass-y');
        }, { passive: true });
      }
    }

    updateHighlight(event) {
      this.pendingPointer = { x: event.clientX, y: event.clientY };
      if (this.highlightFrame) return;

      this.highlightFrame = requestAnimationFrame(() => {
        this.highlightFrame = 0;
        const rect = this.element.getBoundingClientRect();
        if (!rect.width || !rect.height || !this.pendingPointer) return;
        const x = ((this.pendingPointer.x - rect.left) / rect.width) * 100;
        const y = ((this.pendingPointer.y - rect.top) / rect.height) * 100;
        this.element.style.setProperty('--glass-x', `${Math.max(0, Math.min(100, x)).toFixed(1)}%`);
        this.element.style.setProperty('--glass-y', `${Math.max(0, Math.min(100, y)).toFixed(1)}%`);
      });
    }

    scheduleRender() {
      if (this.renderFrame) return;
      this.renderFrame = requestAnimationFrame(() => {
        this.renderFrame = 0;
        this.render();
      });
    }

    render() {
      const rect = this.element.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width < 2 || height < 2 || !this.context) return;

      const cssRadius = getBorderRadius(this.element, width, height);
      const requestedStrength = Number.parseFloat(this.element.dataset.liquidStrength);
      const strength = Number.isFinite(requestedStrength)
        ? requestedStrength
        : Math.min(24, Math.max(16, height * 0.28));
      const geometry = `${width}:${height}:${cssRadius.toFixed(2)}:${strength}`;
      if (geometry === this.lastGeometry) return;
      this.lastGeometry = geometry;

      const renderScale = Math.min(
        1,
        MAX_MAP_WIDTH / width,
        Math.sqrt(MAX_MAP_PIXELS / (width * height))
      );
      const mapWidth = Math.max(2, Math.round(width * renderScale));
      const mapHeight = Math.max(2, Math.round(height * renderScale));
      const radius = Math.min(cssRadius * renderScale, mapWidth / 2, mapHeight / 2);
      const edgeBand = Math.max(
        5,
        Math.min(22 * renderScale, radius * 0.78, mapHeight * 0.34)
      );

      this.canvas.width = mapWidth;
      this.canvas.height = mapHeight;
      const pixels = new Uint8ClampedArray(mapWidth * mapHeight * 4);
      const halfWidth = mapWidth / 2;
      const halfHeight = mapHeight / 2;

      for (let y = 0; y < mapHeight; y += 1) {
        for (let x = 0; x < mapWidth; x += 1) {
          const px = x + 0.5 - halfWidth;
          const py = y + 0.5 - halfHeight;
          const distance = roundedRectSDF(px, py, halfWidth, halfHeight, radius);
          let red = 128;
          let green = 128;

          if (distance <= 0 && distance >= -edgeBand) {
            const gx = roundedRectSDF(px + 1, py, halfWidth, halfHeight, radius) -
              roundedRectSDF(px - 1, py, halfWidth, halfHeight, radius);
            const gy = roundedRectSDF(px, py + 1, halfWidth, halfHeight, radius) -
              roundedRectSDF(px, py - 1, halfWidth, halfHeight, radius);
            const gradientLength = length(gx, gy) || 1;
            const edge = Math.pow(smoothStep(-edgeBand, 0, distance), 0.82);
            red += (-gx / gradientLength) * edge * 127;
            green += (-gy / gradientLength) * edge * 127;
          }

          const index = (y * mapWidth + x) * 4;
          pixels[index] = clampByte(red);
          pixels[index + 1] = clampByte(green);
          pixels[index + 2] = 128;
          pixels[index + 3] = 255;
        }
      }

      this.context.putImageData(new ImageData(pixels, mapWidth, mapHeight), 0, 0);
      const mapUrl = this.canvas.toDataURL('image/png');

      this.filter.setAttribute('x', '0');
      this.filter.setAttribute('y', '0');
      this.filter.setAttribute('width', String(width));
      this.filter.setAttribute('height', String(height));
      this.image.setAttribute('width', String(width));
      this.image.setAttribute('height', String(height));
      this.image.setAttribute('href', mapUrl);
      this.image.setAttributeNS(XLINK_NS, 'href', mapUrl);
      this.displacement.setAttribute('scale', String(strength));

      this.element.style.setProperty('--liquid-filter', `url("#${this.id}-filter")`);
      this.element.dataset.liquidGlassReady = 'true';
    }
  }

  function init() {
    document.querySelectorAll('[data-liquid-glass]').forEach((element) => {
      instances.push(new LiquidGlassSurface(element));
    });

    window.liquidGlassNavbar = {
      refresh() {
        instances.forEach((instance) => {
          instance.lastGeometry = '';
          instance.scheduleRender();
        });
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
