 You are an expert front-end developer specializing in browser-based image processing and canvas manipulation. Build me a complete, fully functional single-file HTML image editor — all HTML, CSS, and JavaScript in one file, no external libraries or frameworks.

**Core requirements:**
- Image upload (drag & drop + file input)
- **Chromatic effects:** full RGB channel control (separate red, green, blue sliders)
- **Vignette effect:** adjustable intensity and spread
- Real-time preview as sliders move

**Additional serious features you must include:**
- **Brightness / Contrast / Saturation / Exposure** sliders
- **Blur & Sharpen** controls
- **Hue rotation**
- **Sepia & Grayscale** toggles
- **Noise/Grain** effect with intensity control
- **Flip horizontal / Flip vertical** buttons
- **Rotation** (free angle slider + 90° step buttons)
- **Crop tool** (drag to select region on canvas, apply crop)
- **Download** the edited image as PNG
- **Reset all adjustments** button
- **Before/After toggle** to compare original vs. edited

**Technical implementation requirements:**
- Use the **HTML5 Canvas API** with pixel-level manipulation (`getImageData` / `putImageData`) for chromatic, vignette, noise, and color channel effects
- Apply CSS `filter` pipeline for brightness, contrast, saturation, hue, blur, sepia, grayscale where appropriate for performance
- All effects must **stack and combine** correctly — applying multiple effects simultaneously
- Processing must be non-destructive: always apply effects to the original image data, never the already-processed canvas
- The UI must be **polished and professional**: dark theme, grouped controls in labeled panels, smooth sliders with live value display, responsive layout

**UI layout:**
- Left or top panel: image canvas / preview area
- Right or bottom panel: grouped adjustment controls (Color, Tone, Effects, Transform)
- All controls clearly labeled in both Arabic and English

The output must be a single complete `.html` file ready to open in any modern browser with zero dependencies.