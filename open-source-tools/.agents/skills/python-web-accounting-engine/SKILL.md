---
name: python-web-accounting-engine
description: A production-grade framework for building robust, double-entry accounting systems using Python and modern web architectures.
license: Apache 2.0
---

# Python Web Accounting Engine

**Role**: Financial Systems Architect

Accounting software is not a standard CRUD application; it is a system of record where integrity is the only currency. Your goal is to build a "Single Source of Truth" that adheres to GAAP (Generally Accepted Accounting Principles) and IFRS standards. You do not "update" balances; you append transactions. You do not use floats; you use exact decimals. You do not delete; you reverse.

## Capabilities

- **Double-Entry Ledger Engine**: Implementation of a strict "Debits = Credits" validation layer.
- **Immutable Audit Trails**: Cryptographically linked or strictly append-only logs for every financial movement.
- **Real-time Financial Reporting**: Generation of Balance Sheets, P&L Statements, and Trial Balances using optimized SQL aggregation.
- **Hierarchical Chart of Accounts (CoA)**: Support for nested account structures (Assets, Liabilities, Equity, Revenue, Expenses).
- **Multi-Currency & Exchange Handling**: Precise handling of currency conversions at the transaction level.

## Patterns

### 1. The Immutable Ledger Schema

The core of the system must be a `JournalEntry` and `Transaction` (or `Split`) relationship. Never store the "current balance" as the primary source of truth; the balance is a derivative of the sum of all transactions.

**Recommended Directory Structure:**

```text
accounting_core/
├── engine/
│   ├── double_entry.py      # Core logic for balancing
│   ├── calculators.py       # Tax, Depreciation, Interest
│   └── validators.py        # Compliance checks
├── models/
│   ├── account.py           # Chart of Accounts
│   ├── journal.py           # Journal Headers
│   └── ledger.py            # Transaction line items (Splits)
├── services/
│   ├── posting_service.py   # Atomic posting logic
│   └── reporting_service.py # SQL-heavy report generation
└── api/
    └── serializers.py       # Strict financial data validation
```

### 2. The Atomic Posting Pattern

Financial transactions must be atomic. If one side of the entry fails, the entire block must roll back. Use Python's context managers to ensure integrity.

```python
from decimal import Decimal
from django.db import transaction

class AccountingEngine:
    @transaction.atomic
    def post_transaction(self, journal_header, entries):
        """
        entries: List of dicts {'account': acc_obj, 'debit': D, 'credit': C}
        """
        total_debit = sum(e['debit'] for e in entries)
        total_credit = sum(e['credit'] for e in entries)

        if total_debit != total_credit:
            raise UnbalancedTransactionError(f"Mismatch: {total_debit} != {total_credit}")

        # Create Journal Entry Header
        header = JournalEntry.objects.create(**journal_header)

        # Create Ledger Splits
        ledger_entries = [
            LedgerSplit(
                journal_entry=header,
                account=e['account'],
                debit=e['debit'],
                credit=e['credit']
            ) for e in entries
        ]
        LedgerSplit.objects.bulk_create(ledger_entries)
        
        return header
```

## Operational Frameworks

### Transaction Validation Tier

| Tier | Check | Description |
| :--- | :--- | :--- |
| **Tier 1** | Arithmetic | Sum(Debits) - Sum(Credits) === 0. |
| **Tier 2** | Period | Is the accounting period open for this date? |
| **Tier 3** | Authorization | Does the user have the "Post" permission for this specific Journal? |
| **Tier 4** | Consistency | Does this transaction violate account-type constraints (e.g., negative cash)? |

### The "Decimal Only" Mandate

Never use `float` for currency. Floats introduce rounding errors that compound over millions of transactions.

```python
# WRONG
amount = 0.1 + 0.2  # Result: 0.30000000000000004

# CORRECT
from decimal import Decimal, getcontext
getcontext().prec = 28
amount = Decimal('0.1') + Decimal('0.2')  # Result: 0.3
```

## Anti-Patterns

### ❌ The "Update Balance" Anti-Pattern
**Why bad**: Storing a `current_balance` column in an `Account` table and updating it via `balance += amount` leads to race conditions and makes it impossible to audit *why* the balance is what it is.
**Instead**: Calculate balances by summing ledger entries (use indexed materialized views or caching for performance).

### ❌ Hard Deleting Transactions
**Why bad**: Financial history must be preserved for audits. Deleting a record creates a "hole" in the ledger.
**Instead**: Use "Voiding" or "Reversing Entries." To cancel a $100 debit, create a $100 credit in a new transaction.

### ❌ Generic Error Messages
**Why bad**: In accounting, "Something went wrong" is unacceptable.
**Instead**: Provide specific error codes: `ERR_UNBALANCED_ENTRY`, `ERR_CLOSED_PERIOD`, `ERR_INSUFFICIENT_FUNDS`.

## Related Skills

Works well with: `database-performance-tuning`, `security-audit-compliance`, `distributed-systems-idempotency`---