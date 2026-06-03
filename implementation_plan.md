# Implementation Plan: Option B - Focused Top & Bottom Accents

We will implement **Option B** to restore a clean, premium, and readable aesthetic to your website while keeping the pixel art cloud accents in focused, high-impact areas.

---

## 1. Proposed Background Mapping
We will apply the cloud backgrounds only to the entrance and exit sections of the website. All intermediate body sections will be reverted to their clean, native backgrounds.

### 1.1 Main Page (`index.html`)
| Section / Selector | Background Status | Target Image | Opacity & Blending |
| :--- | :--- | :--- | :--- |
| **Hero Header** (`header.hero`) | **Active** | `assets/cloud-bg-7.jpg` (Dawn) | `opacity: 0.15` (15% opacity, multiply) |
| **Experience** (`#experience`) | *None* (Reverted to white) | None | - |
| **Education** (`#education`) | *None* (Reverted to white) | None | - |
| **Skills** (`#skills`) | *None* (Reverted to white) | None | - |
| **Tool Stack** (`#tool-stack`) | *None* (Reverted to white) | None | - |
| **Beliefs** (`#beliefs`) | *None* (Reverted to beige `#f5f3ef`) | None | - |
| **Split-Flap Board** (`#flap-section`)| **Active** | `assets/cloud-bg-3.jpg` (Night) | `opacity: 0.25` (25% opacity, screen) |

### 1.2 Wins & Campus Page (`more.html`)
| Section / Selector | Background Status | Target Image | Opacity & Blending |
| :--- | :--- | :--- | :--- |
| **Hero Header** (`header.hero`) | **Active** | `assets/cloud-bg-7.jpg` (Dawn) | `opacity: 0.15` (15% opacity, multiply) |
| **Wins & Highlights** (`#wins`) | *None* (Reverted to white) | None | - |
| **Campus Leadership** (`#campus-leadership`) | *None* (Reverted to white) | None | - |

---

## 2. Technical Reversion & Clean Up
We will remove the visual clutter (border boxes, white backing cards, shadows, and extra paddings) introduced during the high-opacity implementation, returning the body content to its clean, spacious layouts.

### 2.1 CSS Layout Adjustments
1. **Section Labels**: Revert `.section-label`, `.skill-category-label`, and `.tool-cluster-label` to their original borderless text style (removing backgrounds, borders, shadow, blur, and resetting the color to `#6F6F6F` / `var(--muted)`).
2. **Tool Stack Grid & Cards**:
   * Restore `.pill-tool` under `#tool-stack` to a borderless, transparent button layout (removing background, borders, blur, padding, and resetting the logo dimensions).
   * Maintain the optimized **2-column layout** on desktop for `.tool-stack-grid` because it keeps the categories balanced and compact.
3. **Hero Headings**: Remove the text-shadow backlight glow from `.hero h1` since the 15% opacity sunrise background is extremely light and will not conflict with black text readability.
4. **Section Background Colors**:
   * Set body background and default sections background-color to `transparent` (so they inherit the body's white color).
   * Revert `#beliefs` background to its original warm beige color (`#f5f3ef`).

---

## 3. Step-by-Step Execution Plan

### 3.1 Step 1: Update CSS in index.html
* Modify the background styles block to target only `header.hero` and `#flap-section` pseudo-elements.
* Revert `.section-label`, `.skill-category-label`, and `.tool-cluster-label` rules to their original layout.
* Revert `.pill-tool` and `#beliefs` styling rules.
* Keep the text scramble engine placeholder as `"How I build data & AI systems"`.

### 3.2 Step 2: Update CSS in more.html
* Modify background styles block to target only `header.hero` pseudo-element.
* Revert `.section-label` rules.

### 3.3 Step 3: Synchronize Workspaces & Git Commit
Sync updated HTML files across primary, IDE, and backup directories and push the commit to GitHub `origin/main`.

---

## 4. Verification Plan
* Re-invoke the `browser` subagent to capture updated viewport and page screenshots to verify that the body sections are clean and the hero/flap accents blend perfectly.
