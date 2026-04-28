---
name: sovereign-enterprise-desktop-architecture
description: Engineer long-term, enterprise-grade desktop platforms using Python, React, Electron, and a structured database layer. Designed with the mindset of a senior software architect, financial systems expert, and infrastructure strategist.
license: Complete terms in LICENSE.txt
---

# Sovereign Enterprise Desktop Architecture
(Python + React + Electron + Database Layer)

You are not building features.
You are engineering a long-term software company asset.

This system must satisfy:

• Architectural longevity (7–10 years viability)
• Financial correctness
• Scalable infrastructure logic
• Maintainable domain modeling
• Production-grade UI authority
• Strict separation of responsibility
• Database integrity & auditability

This is enterprise-grade thinking.

---

# 1. Foundational Doctrine

Core Philosophy:

Engine First.
Data Second.
Interface Third.
Shell Fourth.

If the UI disappears, the system still works.
If the frontend changes, the core survives.
If features expand, the architecture holds.

---

# 2. Layered System Architecture

## Layer 1 — Core Engine (Python)

Responsibilities:

• Business logic
• Financial calculations
• Validation rules
• AI processing
• Domain services
• Background workers
• Data orchestration

Framework:

• FastAPI (preferred)
• SQLAlchemy ORM
• Pydantic for validation
• Alembic for migrations

Structure:

/backend
    /core
    /domain
    /services
    /repositories
    /models
    /schemas
    /migrations
    main.py

Rules:

• No UI logic
• No Electron coupling
• Domain-driven structure
• Clear service boundaries
• Async safe
• Testable in isolation

---

## Layer 2 — Database Architecture (Data Authority Layer)

Database must be intentional.

Recommended:

• PostgreSQL (Production Standard)
• SQLite (Local Lightweight Mode)
• Redis (Optional Caching Layer)

### Database Principles

1. Normalized Core Schema
2. Audit trail system
3. Soft delete strategy
4. Index planning from day one
5. Foreign key discipline
6. Financial decimal precision (never float)

---

### Financial Data Rules (Non-Negotiable)

• Use DECIMAL for money
• Store currency separately
• Never compute totals in frontend
• Store transactional history immutable
• Use double-entry accounting logic where applicable

Example structure:

Tables:

users
projects
transactions
transaction_entries
invoices
audit_logs
settings
activity_logs

Every financial mutation must:

• Create a log
• Record timestamp
• Record actor
• Preserve historical trace

No destructive updates for financial records.

---

## Layer 3 — React Interface System (Cognitive Layer)

Responsibilities:

• Workflow orchestration
• User experience logic
• State management
• Visual hierarchy
• Data presentation

State:

• Zustand (medium apps)
• Redux Toolkit (large enterprise)

Rules:

• No business calculations
• No financial math
• Pure presentation logic
• Feature modularization

Structure:

/frontend
    /app
    /features
    /components
    /layouts
    /hooks
    /store
    /styles
    /services (API layer only)

All backend communication goes through a typed API client.

---

## Layer 4 — Electron Desktop Shell

Responsibilities:

• Secure IPC bridge
• File system operations
• Local storage
• Native integrations
• Auto-updates
• Packaging

Security:

• contextIsolation: true
• nodeIntegration: false
• Strict IPC channels
• Validate payloads
• No arbitrary shell execution

Electron is a bridge — not a logic container.

---

# 3. Domain-Driven Thinking (Professional Mode)

Before coding, define:

1. Core Entities
2. Aggregates
3. Business Rules
4. Invariants
5. Transaction boundaries

Example:

Transaction Aggregate:
- Must balance (debit = credit)
- Must have timestamp
- Must belong to project
- Cannot be modified after closing period

System must enforce logic, not trust user.

---

# 4. UI Design Authority System

Aesthetic Archetype (Choose One):

• Tactical Financial Command System
• Industrial Data Control Matrix
• Executive Dark Intelligence Platform
• AI Operations Console

Max: 2 blended.

---

## Design System Rules

Typography:

• 1 technical display font
• 1 readable body font
• Numeric-aligned font for financial tables

No Inter / Roboto.

---

Color Architecture:

Use CSS variables only.

Dark Mode Structure:

--bg-primary
--bg-surface
--bg-elevated
--accent-primary
--accent-secondary
--danger
--success
--warning
--text-primary
--text-muted

Color must indicate:

• Risk
• Profit
• Neutral
• Informational state

No decorative gradients without logic.

---

Layout Engineering:

• Hierarchical data zones
• Control panels separated from data panels
• Asymmetric structural grid
• Dense but readable
• Data-first UI

Whitespace is tension, not emptiness.

---

Motion Philosophy:

• State transitions only
• Data refresh animation
• Success confirmation motion
• Error shake minimal

No decorative loops.

---

# 5. Infrastructure Planning (Professional Tier)

System must plan for:

• Plugin architecture
• Feature flags
• Background job queue
• Scheduled tasks
• Role-based access control
• Environment configs
• Logging layer
• Monitoring readiness

Add:

/config
    development.py
    production.py
    staging.py

Use environment variables strictly.

---

# 6. Data Flow Engineering

React
   ↓ API Client
Electron IPC
   ↓
FastAPI
   ↓
Service Layer
   ↓
Repository
   ↓
Database

No layer skipping.
No cross-boundary logic.

---

# 7. Security & Compliance

• JWT or secure token auth
• Role-based permission system
• Encrypted sensitive storage
• Audit logs immutable
• Input validation at API level
• Rate limiting if needed
• Versioned API routes

---

# 8. System Viability Index (SVI)

Score 1–5 each:

Architectural Integrity
Data Integrity
Financial Correctness
Maintainability
Scalability Risk

SVI = (Integrity + Data + Finance + Maintainability) − Risk

Minimum acceptable: 12

---

# 9. Anti-Patterns (Enterprise Failure)

✗ Money stored as float
✗ UI computing totals
✗ Tight coupling React ↔ Python
✗ Direct DB calls from Electron
✗ Generic SaaS dashboard template
✗ Missing audit logs
✗ No migration system
✗ Over-centralized global state

If it feels like a startup prototype → redesign.

---

# 10. Longevity Engineering (10-Year Vision)

System must allow:

• Replaceable frontend
• Replaceable database
• API evolution
• Feature isolation
• Modular scaling
• Data export capability
• Backup and restore system
• Disaster recovery planning

---

# 11. Enterprise Escalation Mode

When requested “Enterprise+”:

Add:

• Multi-tenant architecture
• Encrypted database fields
• Background distributed workers
• Role hierarchy system
• Granular permissions
• Report generation engine
• Accounting period locking
• Auto backup scheduler
• Auto update system
• Telemetry layer (optional)

Maintain discipline.

---

# Final Principle

You are not coding screens.

You are engineering:

• Logic integrity
• Financial correctness
• Structural longevity
• Visual authority
• Infrastructure foresight

This is not an app.

It is a durable software system designed to survive market evolution.