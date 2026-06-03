# Implementation Plan: Pixelated Cloud Section Backgrounds

We will integrate retro pixel art cloud asset backgrounds into each header and section of your portfolio website to create a visually interesting, unified, and premium aesthetic.

---

## 1. Proposed Background Asset Mapping
Based on the CraftPix/Dribbble asset pack you provided, we will map a unique pixel art sky background to each section of your website.

### 1.1 Home Page (`index.html`)
| Section | Element ID / Selector | Asset Source | Theme / Mood |
| :--- | :--- | :--- | :--- |
| **Hero Entrance** | `header.hero` | Image 7 (Sunrise/Dawn) | Warm, optimistic, and welcoming entrance. |
| **Experience** | `#experience` | Image 5 (Purple Evening Sky) | Professional yet creative/retro. |
| **Education** | `#education` | Image 6 (Sunset Blue-Pink) | Dynamic, multi-layered color transition. |
| **Skills** | `#skills` | Image 2 (Sunset Orange-Purple) | Vibrant and colorful highlighting capabilities. |
| **Tool Stack** | `#tool-stack` | Image 8 (Clear Day Sky) | Clean, technical, and light-themed. |
| **Beliefs** | `#beliefs` | Image 9 (Cloudy Day Sky) | Optimistic daytime clouds. |
| **Split-Flap Board** | `#flap-section` | Image 3 (Starry Night Sky) | Retro dark mode sky that matches the dark panel. |

### 1.2 Wins & Campus Page (`more.html`)
| Section | Element ID / Selector | Asset Source | Theme / Mood |
| :--- | :--- | :--- | :--- |
| **Hero Entrance** | `header.hero` | Image 7 (Sunrise/Dawn) | Unified header design. |
| **Wins & Highlights** | `#wins` | Image 4 (Pink Sunset) | Celebratory pink tones. |
| **Campus Leadership** | `#campus-leadership` | Image 1 (Classic Blue Sky) | Energetic and active daytime sky. |

---

## 2. Technical Implementation Details
To prevent these colorful pixel art images from distracting from the text or failing accessibility/contrast audits, we will use a pseudo-element layer technique.

### 2.1 CSS Styling Strategy
We will absolute-position a `::before` pseudo-element inside each section and headers. 

```css
/* Styling containers to allow background overlay without breaking readability */
header.hero, section {
  position: relative;
  overflow: hidden;
}

/* Ensure all content sits on top of the background layers */
header.hero > *, section > * {
  position: relative;
  z-index: 2;
}

/* Base background pseudo-element configuration */
header.hero::before, section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 1;
}

/* Default light theme behavior (extremely subtle mix) */
header.hero::before,
section:not(#flap-section)::before {
  opacity: 0.055; /* Low opacity to keep text perfectly readable */
  mix-blend-mode: multiply; /* Blends nicely with white and off-white background colors */
}

/* Special dark theme section behavior (split-flap) */
#flap-section::before {
  opacity: 0.12; /* Starry night sky needs to stand out against the black background */
  mix-blend-mode: screen; /* Screens out dark tones to show only stars and highlights */
}

/* Mapping background image assets */
header.hero::before { background-image: url('assets/cloud-bg-7.jpg'); }
#experience::before { background-image: url('assets/cloud-bg-5.jpg'); }
#education::before { background-image: url('assets/cloud-bg-6.jpg'); }
#skills::before { background-image: url('assets/cloud-bg-2.jpg'); }
#tool-stack::before { background-image: url('assets/cloud-bg-8.jpg'); }
#beliefs::before { background-image: url('assets/cloud-bg-9.jpg'); }
#flap-section::before { background-image: url('assets/cloud-bg-3.jpg'); }

#wins::before { background-image: url('assets/cloud-bg-4.jpg'); }
#campus-leadership::before { background-image: url('assets/cloud-bg-1.jpg'); }
```

---

## 3. Step-by-Step Execution Plan

### 3.1 Step 1: Fetch and Save Assets
We will execute a PowerShell script to fetch the high-resolution JPG previews of the cloud backgrounds from the CraftPix CDN, renaming them to local files:
* Image 1 $\rightarrow$ `assets/cloud-bg-1.jpg`
* Image 2 $\rightarrow$ `assets/cloud-bg-2.jpg`
* Image 3 $\rightarrow$ `assets/cloud-bg-3.jpg`
* Image 4 $\rightarrow$ `assets/cloud-bg-4.jpg`
* Image 5 $\rightarrow$ `assets/cloud-bg-5.jpg`
* Image 6 $\rightarrow$ `assets/cloud-bg-6.jpg`
* Image 7 $\rightarrow$ `assets/cloud-bg-7.jpg`
* Image 8 $\rightarrow$ `assets/cloud-bg-8.jpg`
* Image 9 $\rightarrow$ `assets/cloud-bg-9.jpg`

### 3.2 Step 2: Inject CSS Rules
Inject the styling rules into both [index.html](file:///C:/Users/yashd/.gemini/antigravity/scratch/yash-dugar/index.html) and [more.html](file:///C:/Users/yashd/.gemini/antigravity/scratch/yash-dugar/more.html). No content structure needs to change.

### 3.3 Step 3: Synchronize Code & Workspace
Sync files across all duplicate directories on your system (`antigravity`, `antigravity-ide`, `antigravity-backup`) and commit changes to Git.

---

## 4. Verification & Testing Plan

### 4.1 Visual and Contrast Checks
* **Contrast Audits**: Check that white-background sections with light text (e.g. titles or description texts) remain well above a 4.5:1 ratio against the subtle cloud layers.
* **Layout Shifts**: Verify that loading local background images doesn't cause content jumps or lag.
* **Responsiveness**: Ensure the cover background scales properly without distortion on mobile, tablet, and wide desktop screens.
