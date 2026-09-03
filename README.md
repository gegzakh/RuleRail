# RuleRail

**Payment Standards Intelligence & Client Readiness Platform**

RuleRail turns fragmented payment-standard changes into versioned bank-specific rules, executable checks, client actions and auditable readiness evidence. The first demonstration use case covers structured and hybrid postal-address requirements across EPC payment schemes and Swift ISO 20022 flows.

> This repository contains a public, synthetic product demo. It does not initiate, process, route or settle payments, and its illustrative bank profiles are not implementation guidance.

## What the demo shows

- Command center with separate EPC and Swift timelines
- Governed standards and rule catalogue with authoritative source links
- Three-bank comparison for one payment scenario
- Browser-local ISO 20022 address validation with explainable findings
- White-label corporate-client readiness portfolio
- Change impact across clients, messages, systems and tests
- Task, evidence and certification journey
- Responsive enterprise UI and Vercel Web Analytics instrumentation

All company names, bank profiles, client records and operational metrics are fictional.

## Documentation

- [Business Requirements Document](./docs/BRD.md)
- [High-Level Design](./docs/HLD.md)
- [Detailed Design & Functional Requirements](./docs/LLD-FUNCTIONAL-REQUIREMENTS.md)

## Run locally

The demo has no runtime dependencies.

```bash
npm run check
npx serve dist
```

Then open the local URL printed by `serve`.

## Repository structure

```text
dist/                         Static web application
docs/BRD.md                   Business scope and requirements
docs/HLD.md                   Target and demo architecture
docs/LLD-FUNCTIONAL-REQUIREMENTS.md
                               Detailed behavior, data, APIs and acceptance
scripts/verify-static.js      Build-time static-bundle checks
tests/validation.test.js      Deterministic validation tests
vercel.json                   Vercel output, routing and security headers
```

## Regulatory baseline

The demonstration baseline is 3 September 2026:

- The EPC stated that 15 November 2026 remained the end date for unstructured addresses under its schemes pending its board discussion on 9 September 2026.
- Swift announced on 27 August 2026 that it would defer the Standards Release 2026 payments changes and consult on revised timing.

Official sources:

- [EPC address-format announcement](https://www.europeanpaymentscouncil.eu/news-insights/news/november-2026-end-date-unstructured-address-format-epc-payment-scheme)
- [EPC guidance on provision of addresses](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/epc-guidance-document-provision-addresses-under-epc-payment)
- [Swift timeline extension](https://www.swift.com/news-events/news/swift-accepts-community-request-extend-structured-address-migration-iso-20022-payment-messages)
- [Swift ISO 20022](https://www.swift.com/standards/iso-20022)

## Production direction

The demo is intentionally static and browser-local. The HLD recommends a multi-tenant modular platform with governed rule/profile versions, deterministic server-side validation, PostgreSQL, object evidence storage, OIDC/RBAC, tenant isolation, background workers and immutable audit.

## Analytics and privacy

Vercel Web Analytics is loaded from `/_vercel/insights/script.js`. Product events include only view identifiers, non-sensitive filter categories and validation outcome counts. Payment XML, account data, postal-address values and personal names are never sent as analytics properties.

## License

Copyright © 2026 FinTech Tomorrow. All rights reserved. No licence is granted for production or commercial use without written permission.
