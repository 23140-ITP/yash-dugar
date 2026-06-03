# Implementation Plan: UI/UX & Legibility Fixes (90% Opacity Clouds)

We have conducted a thorough browser audit using the `browser` subagent to analyze how the website renders with the pixel art cloud backgrounds set to **90% opacity** (`opacity: 0.9`). 

At 90% opacity, the vibrant sky textures dominate the canvas, making several critical text labels (styled in muted grey `#6F6F6F`) completely unreadable and creating visual noise.

---

## 1. Proposed Changes
To preserve the 90% opacity of the clouds as requested, we must insulate and protect the floating text elements using **glassmorphism** (semi-transparent white backings with backdrop blur) and increase text contrast.

### 1.1 Glassmorphic Section Badges
We will style the section labels (`.section-label`, `.skill-category-label`, `.tool-cluster-label`) as elegant glassmorphic pills with solid black text. This keeps them highly legible and adds a modern premium feel.

```css
.section-label {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #000000 !important; /* Forces high-contrast black */
  box-shadow: var(--shadow-xs);
  margin-bottom: 28px;
}
```

### 1.2 Glassmorphic Cards for the Tool Stack (`#tool-stack`)
Instead of floating transparent icons directly on top of the bright sunset background, we will transform the tool items into beautiful glassmorphic buttons. This prevents dark logos (like Perplexity and Comet) and muted grey labels from disappearing.

```css
.pill-tool {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: var(--r8);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  gap: 8px;
  min-width: 90px;
  box-shadow: var(--shadow-xs);
}

.pill-tool:hover {
  background: #ffffff;
  transform: translateY(-4px);
  border-color: #000000;
  box-shadow: var(--shadow-sm);
}

.tool-name {
  font-size: 13px;
  font-weight: 600;
  color: #000000 !important;
}
```

### 1.3 Hero Title Backlight
We will add a soft white backlight glow to the hero title headings to wash out the high-contrast pixels directly behind the text, improving legibility:

```css
.hero h1 {
  text-shadow: 0 0 35px rgba(255, 255, 255, 0.95), 
               0 0 20px rgba(255, 255, 255, 0.90),
               0 0 10px rgba(255, 255, 255, 0.80);
}
```

### 1.4 Beliefs Section Blend Fix
* We will change the background blend mode on all light sections from `multiply` to `normal` so the images render in their crisp, original colors without creating muddy/brown tones on top of beige sections like `#beliefs`.
* Change the background color of `#beliefs` from beige (`#f5f3ef`) to white (`#ffffff`) to keep the page background clean and unified.

---

## 2. Step-by-Step Execution Plan

### 2.1 Step 1: Update CSS in index.html
Apply the glassmorphic badges, card layouts for tool pills, hero text backlights, and blend mode changes inside the style tags of [index.html](file:///C:/Users/yashd/.gemini/antigravity/scratch/yash-dugar/index.html).

### 2.2 Step 2: Update CSS in more.html
Apply the same glassmorphic section badges and header titles changes inside the style tags of [more.html](file:///C:/Users/yashd/.gemini/antigravity/scratch/yash-dugar/more.html).

### 2.3 Step 3: Synchronize Workspaces & Git push
Sync updated HTML files across all three directories (primary, backup, IDE) and push the commit to GitHub `origin/main`.

---

## 3. Verification Plan
* Re-invoke the `browser` subagent to take new viewport and page screenshots to confirm the legibility improvements.
* Verify that text-to-background contrast ratio meets WCAG 2.1 AA requirements.
