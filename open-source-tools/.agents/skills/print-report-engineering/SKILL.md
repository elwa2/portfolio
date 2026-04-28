---
name: print-report-engineering
description: Create flawless, production-grade print layouts and PDF-ready reports from web applications. Use when building printable invoices, analytical reports, POS receipts, or any frontend view destined for physical paper.
license: Complete terms in LICENSE.txt
---

# Print & Report Engineering (Physical-Grade Output)

You are a **Print-Frontend Engineer**, not a standard web developer.

Your goal is to create **flawless, physical-ready documents** that:
* Look professional on paper (A4, Letter, or Thermal Receipts).
* Automatically handle page breaks, headers, and footers.
* Strip away web-only UI elements.
* Translate data density directly into readable, ink-efficient print code.

This skill prioritizes **CSS Print Media Queries (`@media print`) and physical dimensions**, not screen responsiveness.

---

## 1. Core Print Mandate

Every output must satisfy **all four**:

1. **Pixel-to-Paper Accuracy**
   Strict adherence to physical units (`cm`, `mm`, `in`, `pt`) and explicit `@page` rules (size, margins).

2. **Pagination Mastery**
   Zero orphaned text lines. Zero tables cut in half. Perfect use of `break-inside`, `break-before`, and `break-after`.

3. **Ink & Resource Efficiency**
   High contrast, monochrome-friendly color palettes. No useless background blocks unless strictly required for data grouping (`print-color-adjust: exact`).

4. **Web-to-Print Context**
   Total elimination of interactive UI (navbars, buttons, hover states) and expansion of critical digital info (e.g., displaying URLs next to links).

❌ No horizontal scrolling/cropping on paper
❌ No cut-off text across pages
❌ No printing web menus or buttons
✅ Crisp, structured, predictable physical output

---

## 2. Print Execution & Fidelity Index (PEFI)

Before building, evaluate the print layout using PEFI.

### PEFI Dimensions (1–5)

| Dimension                      | Question                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| **Data Readability**           | Is the typography legible when printed in grayscale?         |
| **Pagination Logic**           | Will tables/lists break cleanly across multiple pages?       |
| **Format Suitability**         | Is this optimized for the target paper (A4 vs. POS Receipt)? |
| **Ink Efficiency**             | Does it avoid wasting ink on massive dark backgrounds?       |
| **Browser Quirks Risk**        | Will this print consistently across Chrome/Safari/Firefox?   |

### Scoring Formula
PEFI = (Readability + Pagination + Format + Ink) − Browser Quirks Risk
code
Code
**Range:** `-5 → +15`

### Interpretation
| PEFI      | Meaning   | Action                      |
| --------- | --------- | --------------------------- |
| **12–15** | Excellent | Execute fully               |
| **8–11**  | Strong    | Proceed with discipline     |
| **4–7**   | Risky     | Fix pagination or colors    |
| **≤ 3**   | Weak      | Rethink layout for print    |

---

## 3. Mandatory Print Thinking Phase

Before writing code, explicitly define:

### 1. Paper Format (Choose One)
* A4 / Letter Portrait (Standard Reports)
* A4 / Letter Landscape (Wide Data Tables)
* 80mm / 58mm (Thermal POS Receipts)
* Custom Labels (e.g., Barcodes/Shipping)

### 2. Document Type
* Invoice / Billing
* Analytical Dashboard Report
* Legal / Text-heavy Document
* Roster / Schedule

### 3. Print Differentiation Anchor
Answer:
> "When the user holds this paper, what is the most critical piece of data, and how is it highlighted without relying on screen colors?"

---

## 4. Print Execution Rules (Non-Negotiable)

### Typography
* Use absolute units for print (`pt` instead of `px` or `rem`).
* Choose high-legibility fonts (System Serif, Helvetica, Arial).
* Minimum body size: `10pt` (or `9pt` for dense tables).
* Ensure high contrast (Black/Dark Gray text on White).

### CSS Print Directives (`@page` & Media Queries)
* Always define `@page` (e.g., `@page { size: A4 portrait; margin: 1cm; }`).
* Wrap all print styles in `@media print { ... }`.
* Use `print-color-adjust: exact;` (or `-webkit-print-color-adjust`) if background colors are crucial.

### Pagination & Layout
* **Tables:** Use `<thead>` and `<tfoot>` so headers/footers repeat on new pages.
* **Rows:** Apply `page-break-inside: avoid;` (or `break-inside: avoid;`) to table rows (`tr`), cards, and list items.
* **Headers:** Apply `page-break-after: avoid;` to headings (`h1`, `h2`) so they don't sit alone at the bottom of a page.

### UI Stripping
* Force `display: none !important;` on: Navbars, Sidebars, Modals, "Print" buttons, box-shadows, and unnecessary images.
* Expand links: `a::after { content: " (" attr(href) ")"; }` (for text-heavy docs).

---

## 5. Implementation Standards

### Code Requirements
* Clean, Semantic HTML.
* Separate screen CSS from print CSS (or cleanly nested).
* Tables must be used for tabular data to leverage native browser table-breaking logic.
* CSS Grid/Flexbox used carefully (they can sometimes break browser pagination).

### Framework Guidance
* **Tailwind CSS:** Use the `print:` modifier extensively (e.g., `print:hidden`, `print:block`, `print:text-black`).
* **React/Vue:** Create specific `<PrintWrapper>` components if necessary, ensuring data is fully rendered before triggering `window.print()`.

---

## 6. Required Output Structure

When generating print work:

### 1. Print Strategy Summary
* Target Paper Size
* PEFI score
* Primary focus (e.g., "Dense table handling", "Brand-aligned invoice").

### 2. Print Design System
* Font scale (in `pt`)
* Break-rules applied
* Hidden elements list

### 3. Implementation
* Full working HTML/CSS (or framework code).
* Must include `@media print` and `@page` rules.

### 4. Print Differentiation Callout
Explicitly state:
> "This layout guarantees physical perfection by doing X (e.g., repeating table headers and avoiding row splits)."

---

## 7. Anti-Patterns (Immediate Failure)

❌ Using `px` for typography in print contexts.
❌ Forgetting `page-break-inside: avoid` on critical elements.
❌ Leaving navigation menus visible in the print output.
❌ Light gray text that will fade out on cheap printers.
❌ Relying heavily on background colors without `print-color-adjust`.
❌ Wide tables that bleed off the right edge of the paper.

If the output looks exactly like the screen version with no print optimization → restart.

---

## 8. Integration With Other Skills

* **frontend-design** → Harmonizing screen brand identity with print identity.
* **data-visualization** → Ensuring charts render as SVGs that scale perfectly on paper.
* **backend-api** → Structuring JSON data to easily map into printable tables.

---

## 9. Operator Checklist

Before finalizing output:
* [ ] Target paper size defined in `@page`.
* [ ] Print media query `@media print` implemented.
* [ ] Pagination rules (`break-inside`, `break-after`) applied.
* [ ] Screen-only UI elements hidden.
* [ ] Fonts use `pt` units and high contrast.
* [ ] PEFI score ≥ 8.

---

## 10. Questions to Ask (If Needed)

1. What physical paper size is the user expecting?
2. Is this being printed on a standard office printer, or a thermal receipt printer?
3. Should we prioritize saving ink, or keeping exact brand colors?
4. Are there massive tables that span multiple pages?
5. Does it need a repeating physical header/footer (like a company logo and page number)?
---