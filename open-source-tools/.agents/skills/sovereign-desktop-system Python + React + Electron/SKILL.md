---
name: sovereign-desktop-system
description: Architect and engineer long-lifecycle desktop-grade applications using Python (backend core), React (frontend system), and Electron (desktop shell) with production durability, visual authority, and scalable internal architecture.
license: Complete terms in LICENSE.txt
---

# Sovereign Desktop System (Python + React + Electron)

You are not building an app.
You are engineering a long-term software asset.

This system is designed for:
• AI tools
• Data platforms
• Automation software
• Educational systems
• Media generators
• Strategic internal tools

Goal:
Build software that remains maintainable, extensible, and visually elite for 5+ years.

---

# 1. Architectural Doctrine

Core Philosophy:
Backend strength. Frontend precision. Desktop sovereignty.

Stack Authority:

Backend Core → Python  
Frontend System → React  
Desktop Shell → Electron  

Each layer must have strict responsibility boundaries.

---

# 2. Structural Separation Model

## A. Python (Core Engine Layer)

Role:
• Computation
• AI integration
• File handling
• Business logic
• Local database management
• Performance-critical tasks

Rules:
• No UI logic
• API-driven structure (FastAPI or Flask preferred)
• Modular services architecture
• Clear domain separation
• Async where necessary

Folder Model:

/core
    /services
    /models
    /ai
    /utils
    main.py

Backend must expose clean internal APIs consumed by React via Electron bridge.

---

## B. React (Interface Intelligence Layer)

Role:
• State management
• UI logic
• Interaction patterns
• Visual hierarchy
• Workflow control

Rules:
• Component-driven but not template-driven
• Avoid UI libraries unless strategically justified
• Custom design system required
• Centralized state (Zustand / Redux if complex)
• Strict separation between presentational and logic components

Folder Model:

/src
    /components
    /features
    /layouts
    /hooks
    /store
    /styles

UI must feel proprietary — not like public SaaS templates.

---

## C. Electron (Desktop Authority Layer)

Role:
• Secure bridge between Python and React
• File system access
• Local storage
• OS-level permissions
• Packaging & distribution

Rules:
• No heavy logic in main process
• Use preload scripts for secure IPC
• Disable unnecessary Node exposure
• Context isolation enabled
• Strict channel naming convention

Electron must feel invisible but powerful.

---

# 3. Design System Mandate (Frontend)

This is NOT optional.

## Aesthetic Archetype (Choose One)

• Tactical Dark Command System  
• Precision AI Console  
• Industrial Data Terminal  
• Executive Neo-Minimal Platform  
• Futuristic Engine Control  

Max: 2 blended.

---

## Recognition Anchor Requirement

The interface must have one distinctive trait:

Examples:
• Layered panel depth with edge glow logic
• Structured asymmetrical control matrix
• Typography-driven hierarchy grid
• Accent-based workflow segmentation

If logo removed, it must still be recognizable.

---

## Typography Rules

Avoid:
✗ Inter
✗ Roboto
✗ System defaults

Choose:
• 1 technical display font
• 1 neutral body font
• Numeric font for dashboards if needed

Typography must define structure, not decoration.

---

## Color Architecture

Use CSS variables only.

Structure:

--bg-primary
--bg-secondary
--surface-1
--surface-2
--accent-primary
--accent-muted
--text-primary
--text-secondary
--danger
--success

Dark systems must:
• Use layered tonal hierarchy
• Controlled glow accents
• Avoid SaaS purple clichés

---

## Layout Rules

• No symmetric SaaS layouts
• Controlled asymmetry
• Hierarchy through spacing tension
• Functional density (not empty whitespace)
• Clear workflow zones

---

# 4. DFII – System Viability Index

Score 1–5 each:

Architectural Strength
Aesthetic Impact
Maintainability
Performance
Scalability Risk

Formula:

SVI = (Strength + Impact + Maintainability + Performance) − Risk

Minimum acceptable score: 10

If below → refine structure.

---

# 5. Data Flow Engineering

React ↔ Electron (IPC) ↔ Python API

Strict Rules:

• All heavy tasks → Python
• All UI state → React
• All OS access → Electron
• No circular dependencies
• No direct React ↔ Python coupling without IPC

Data contracts must be explicit and version-safe.

---

# 6. Performance Mandate

Python:
• Async tasks
• Background workers if needed
• Lazy model loading

React:
• Memoization where needed
• Avoid unnecessary re-renders
• Code splitting for heavy modules

Electron:
• Minimal preload surface
• Production build optimization
• Disable dev tools in production

---

# 7. Security Doctrine

• Context isolation: true
• Node integration: false
• Secure IPC channels
• Validate all inputs on backend
• No raw shell execution without sanitization
• Encrypted local storage if sensitive

Desktop app ≠ insecure app.

---

# 8. Output Requirements When Generating Code

Always provide:

1. System Overview
2. Folder Architecture
3. Backend Implementation
4. Electron Bridge Setup
5. React Integration
6. Security Config
7. Build Instructions
8. Scaling Strategy

No partial snippets unless requested.

---

# 9. Anti-Patterns (Immediate Failure)

✗ Python logic inside React
✗ Heavy logic inside Electron main
✗ UI template libraries without customization
✗ Random global state sprawl
✗ Mixed architectural responsibility
✗ Generic SaaS dashboard UI

If it feels like a tutorial project → redesign.

---

# 10. Longevity Principles (5+ Year Survival)

• Modular domain logic
• Replaceable frontend layer
• API-first mindset
• Clear versioning
• Feature isolation
• Internal tooling support
• Documentation-ready structure

Software should evolve, not collapse.

---

# 11. Escalation Mode (Enterprise Tier)

If user asks for “enterprise-level”:

Add:

• Internal plugin system
• Multi-process background workers
• Local caching layer
• Feature flags architecture
• Role-based UI logic
• Encrypted database layer
• Auto-update mechanism

But maintain architectural discipline.

---

Final Goal:

Build a sovereign, high-authority desktop application
powered by Python logic,
controlled by React precision,
and delivered through Electron sovereignty.

This is not an app.
It is a long-term digital asset.