# Implementation Plan: Scroll Performance Optimization (60+ FPS Scrolling)

Your website is currently experiencing lag and stuttering during scroll. We have analyzed the code and found a significant performance bottleneck that stalls the browser's rendering engine.

---

## 1. Root Cause Analysis (Why the Site is Lagging)

### 1.1 The Layout Thrashing Bottleneck
In both `index.html` and `more.html`, you have a scroll handler named `setActiveNav()` bound directly to the window's `scroll` event.

Inside this handler, JavaScript continuously reads the DOM properties `.offsetTop` and `.offsetHeight` for every single section on the page:

```javascript
function setActiveNav() {
  const scrollY = window.scrollY + 120;
  let currentId = '';
  sections.forEach(section => {
    const top = section.offsetTop;        // <-- FORCES SYNCHRONOUS LAYOUT
    const height = section.offsetHeight;  // <-- FORCES SYNCHRONOUS LAYOUT
    if (scrollY >= top && scrollY < top + height) currentId = section.getAttribute('id');
  });
  // ...
}
```

### 1.2 How This Destroys Scroll Performance
1. **Layout Thrashing**: Every time the user scrolls even a single pixel, the scroll event fires. Accessing properties like `offsetTop` and `offsetHeight` forces the browser to immediately pause execution, flush its style/layout queue, and compute the positions of all sections on the page synchronously.
2. **High Frequency**: Scroll events fire up to 120 times per second on high-refresh-rate displays. Doing a synchronous DOM calculation on every single tick stalls the browser's main thread, causing severe dropped frames (jank) and lag.
3. **No Throttling**: The scroll handler is not throttled, meaning the browser tries to run the heavy loop on every scroll event rather than aligning it with the screen's refresh cycle.

---

## 2. Proposed Changes & Technical Approach

We will replace the high-overhead scroll handler with a high-performance, industry-standard modern implementation that runs at **60+ FPS**:

### 2.1 Solution 1: Boundary & Layout Caching
Since your page elements do not change height during natural scrolling, we do not need to query the DOM for `offsetTop` and `offsetHeight` during active scroll.
* We will query and cache all section top/bottom coordinates into a simple, high-speed in-memory JavaScript array **only once** on page load, and update them **only on window resize**.
* During scroll, reading from a pre-calculated numeric array takes less than a microsecond and causes **zero** layout thrashing.

### 2.2 Solution 2: `requestAnimationFrame` Throttling
We will throttle the scroll listener using `requestAnimationFrame` (rAF). This guarantees that the scroll spy logic runs **at most once per screen animation frame**, aligning perfectly with the GPU compositor thread and saving huge amounts of CPU cycles.

---

## 3. Detailed File Modifications

### `[MODIFY]` [index.html](file:///C:/Users/yashd/.gemini/antigravity/scratch/yash-dugar/index.html)
We will replace the scroll spy code with the following high-performance throttled/cached scroll handler:

```javascript
    // -- High-Performance Scroll Spy (rAF throttled & cached offsets) --
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let cachedSections = [];

    // Cache layout offsets on page load and window resize (removes layout thrashing on scroll)
    function cacheSectionBoundaries() {
      cachedSections = Array.from(sections).map(section => {
        const top = section.offsetTop;
        return {
          id: section.getAttribute('id'),
          top: top,
          bottom: top + section.offsetHeight
        };
      });
    }

    let isScrollTickActive = false;
    function setActiveNav() {
      if (!isScrollTickActive) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY + 120;
          let currentId = '';
          
          // Fast array search in memory (no DOM queries)
          for (let i = 0; i < cachedSections.length; i++) {
            const section = cachedSections[i];
            if (scrollY >= section.top && scrollY < section.bottom) {
              currentId = section.id;
              break;
            }
          }
          
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
          });
          
          isScrollTickActive = false;
        });
        isScrollTickActive = true;
      }
    }

    // Event Bindings
    window.addEventListener('scroll', setActiveNav, { passive: true });
    window.addEventListener('resize', cacheSectionBoundaries);
    window.addEventListener('load', () => {
      cacheSectionBoundaries();
      setActiveNav();
    });
    
    // Proactive initial caching
    cacheSectionBoundaries();
```

### `[MODIFY]` [more.html](file:///C:/Users/yashd/.gemini/antigravity/scratch/yash-dugar/more.html)
We will replace the scroll spy code in the subpage with the identical performant cached offset implementation.

---

## 4. Verification Plan

### 4.1 Visual Verification
* Scroll rapidly on both pages to verify that the navigation links switch classes seamlessly with **zero dropped frames or visual lag**.
* Ensure that the scroll spy remains perfectly accurate when resizing the browser window.

### 4.2 Code Analysis
* Verify that no layout-forcing properties (`offsetTop`, `offsetHeight`, `getBoundingClientRect`) are accessed in the active scrolling thread.
* Verify that event listeners use the `{ passive: true }` option to improve standard mobile scroll smoothness.
