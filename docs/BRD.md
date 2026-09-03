# RuleRail Business Requirements Document

**Product:** RuleRail — Payment Standards Intelligence & Client Readiness Platform  
**Document version:** 1.0  
**Status:** Baseline for MVP and target product  
**Prepared for:** FinTech Tomorrow  
**Baseline date:** 3 September 2026

## 1. Executive summary

RuleRail is a B2B platform for banks, payment service providers (PSPs), corporate treasury teams and payment-software vendors. It converts fragmented and changing payment standards into bank-specific requirements, executable validation checks, client actions and auditable readiness evidence.

The first market entry is the migration from unstructured postal addresses to structured or hybrid address data across EPC payment schemes and Swift ISO 20022 flows. The platform is intentionally not tied to one deadline: the same operating model will support future changes to message versions, Verification of Payee, structured remittance information, purpose codes, identifiers and other payment-data obligations.

RuleRail combines two products in one platform:

1. **Multi-bank Rulebook Hub:** a controlled source of truth for scheme, market-infrastructure and bank-specific requirements.
2. **White-label Client Readiness Portal:** a bank-branded workspace that guides corporate clients through impact assessment, testing, remediation and certification.

## 2. Business context

Payment requirements are published across rulebooks, implementation guidelines, usage guidelines, regulatory texts, market-infrastructure specifications and bank-specific onboarding material. Each source can have its own version, publication date, effective date, scope and exceptions.

The address-format transition illustrates the problem. Swift announced on 27 August 2026 that it would defer its planned Standards Release 2026 payments changes and consult on revised timing. At the same time, the EPC stated that its 15 November 2026 timeline remained unchanged pending the Payment Scheme Management Board discussion on 9 September 2026. A corporate using several banks therefore cannot safely treat “ISO 20022 compliance” as one uniform rule.

### 2.1 Authoritative baseline sources

- [EPC address-format announcement](https://www.europeanpaymentscouncil.eu/news-insights/news/november-2026-end-date-unstructured-address-format-epc-payment-scheme)
- [EPC guidance on provision of addresses](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/epc-guidance-document-provision-addresses-under-epc-payment)
- [Swift structured-address timeline extension](https://www.swift.com/news-events/news/swift-accepts-community-request-extend-structured-address-migration-iso-20022-payment-messages)
- [Swift ISO 20022 information](https://www.swift.com/standards/iso-20022)

RuleRail must always retain the authoritative source behind a normalized requirement and must show uncertainty when a governing body has not finalized a decision.

## 3. Problem statement

### 3.1 Fragmented rule sources

Payment teams manually locate and interpret documents from several authorities and banks. There is no controlled view of which rule version is current for a specific payment scenario.

### 3.2 Conflicting or changing timelines

Scheme and network timelines may diverge or change shortly before implementation. Static project plans, spreadsheets and email guidance quickly become stale.

### 3.3 Bank-specific implementation differences

A valid ISO 20022 message can still be rejected because a receiving bank, channel or market infrastructure applies additional restrictions. Multibank corporates must maintain several variations of the same payment process.

### 3.4 Limited change-impact visibility

Organizations cannot consistently connect a changed rule to affected message types, systems, channels, corporate clients, standing orders, file templates, tests and operating procedures.

### 3.5 Uncoordinated client migration

Banks communicate changes using generic emails and attachments. They lack a controlled client journey for acknowledgement, testing, remediation, exception handling and readiness confirmation.

### 3.6 Preventable payment rejection

Corporate files are often checked only after submission. Error messages may identify an XML or scheme failure without explaining the business correction or the source requirement.

### 3.7 Weak management and audit evidence

Management, risk and audit functions cannot readily prove which requirements were considered, which clients were contacted, what tests were completed and who approved an exception.

## 4. Vision and value proposition

### 4.1 Vision

Make payment-rule change consumable as operational data: versioned, comparable, executable, traceable and actionable.

### 4.2 Value proposition

> RuleRail helps banks turn changing payment standards into validated files, coordinated client migrations and provable readiness.

### 4.3 Expected business outcomes

- Reduce avoidable payment-file rejection and manual repair.
- Shorten the time from publication of a rule change to an approved impact assessment.
- Give corporate clients precise, bank-specific actions rather than generic guidance.
- Reduce duplicated interpretation and testing work across business and technology teams.
- Improve management visibility of readiness and residual risk.
- Maintain traceable evidence for audit, compliance and client-support investigations.
- Create a reusable capability for future payment-standard changes.

## 5. Objectives and success measures

| Objective | Target product measure |
|---|---|
| Centralize applicable requirements | 100% of active normalized rules linked to an authoritative source and version |
| Accelerate impact assessment | Material rule changes triaged and mapped to impacted capabilities within one business day after approval |
| Improve file quality | Reduction in rule-related test and production rejects compared with pre-adoption baseline |
| Coordinate client readiness | Every in-scope corporate client has an owner, state, due date and evidence trail |
| Support multibank comparison | A user can compare at least two bank profiles for the same scenario in one workflow |
| Preserve explainability | Every validation finding shows rule, source, version, severity and corrective guidance |
| Establish user trust | No rule is represented as final when its status is draft, deferred, superseded or under review |

Numeric production targets will be baselined with pilot customers because reject rates and client volumes vary materially by institution.

## 6. Stakeholders and user groups

| Stakeholder | Primary need |
|---|---|
| Bank payment product owner | Know what changed, scope the impact and approve the bank interpretation |
| Bank scheme/standards specialist | Maintain authoritative sources, normalized rules and effective dates |
| Corporate banking/client manager | Identify affected clients and coordinate outreach |
| Payment operations analyst | Test files, explain rejects and manage exceptions |
| Technology/architecture team | Identify affected applications, interfaces and message transformations |
| Risk/compliance/audit | Review evidence, decisions, exceptions and completion status |
| Corporate treasury user | Understand bank-specific requirements and test payment files |
| Corporate ERP/integration team | Receive implementable field and message requirements |
| Platform administrator | Configure tenants, branding, roles, reference data and integrations |

## 7. Product scope

### 7.1 MVP scope

The public MVP demonstrates the combined rule-intelligence and client-readiness journeys without authentication, backend storage or real payment data.

#### Standards and schemes

- EPC and Swift as source authorities.
- SCT, SCT Inst, SDD Core, SDD B2B, OCT Inst and Swift CBPR+.
- Structured and hybrid postal-address rules as the initial use case.
- `pain.001`, `pain.008` and `pacs.008` sample validation.

#### Functional capabilities

- Standards timeline and source registry.
- Effective-dated normalized rule catalogue.
- Comparison of fictional bank profiles.
- Field-level requirement matrix.
- Sample XML validation with explainable findings.
- Client readiness portfolio, filters and status updates.
- Migration task and certification views.
- Change-impact summary.
- Management readiness dashboard.
- Browser-local persistence for demo preferences and client states.
- Vercel page-view analytics.

### 7.2 Target product scope

- Multi-tenant bank and corporate workspaces.
- Controlled ingestion and approval of rule-source changes.
- Versioned rule modelling and deterministic execution.
- Real bank implementation profiles and channel variations.
- Bulk payment-file validation and API validation.
- Corporate-client segmentation, outreach, acknowledgement and testing.
- Readiness certification and exception workflow.
- Impact mapping to systems, processes, messages and clients.
- Integration with ERP, TMS, payment hubs, corporate channels and notification services.
- Evidence retention, reporting and audit access.
- SSO, RBAC, tenant isolation and configurable data residency.
- SaaS and bank-managed/on-premises deployment models.

### 7.3 Future capability scope

- Verification of Payee requirements.
- Structured remittance information.
- Purpose codes, LEIs and party identifiers.
- FATF Recommendation 16-related payment-data requirements.
- Additional rails and infrastructures such as TARGET, CHAPS and Fedwire.
- Automated rule-change extraction with mandatory human approval.
- Integration with data-remediation and address-intelligence providers.

### 7.4 Explicitly out of scope

RuleRail will not:

- Initiate, authorize, route, clear or settle payments.
- Replace a payment hub, sanctions engine, AML system, KYC platform or core banking system.
- Make legal interpretations without bank approval.
- Invent or silently overwrite missing customer or beneficiary data.
- Guarantee bank acceptance where unpublished channel or entitlement rules apply.
- Use real customer payment data in the public demonstration.

## 8. Business capabilities and requirements

### 8.1 Standards and source governance

- **BR-001:** The platform shall register each authoritative source with owner, title, URL, jurisdiction, publication date, effective date and lifecycle status.
- **BR-002:** The platform shall preserve all received source versions and indicate superseding relationships.
- **BR-003:** The platform shall classify sources as official, bank-authored or internal interpretation.
- **BR-004:** The platform shall allow a standards specialist to mark a source or requirement as draft, under review, approved, deferred, effective, expired or superseded.
- **BR-005:** The platform shall prevent an unapproved interpretation from becoming an active production validation rule.

### 8.2 Rule intelligence

- **BR-010:** The platform shall normalize source requirements into structured, effective-dated rules.
- **BR-011:** A rule shall identify its authority, scheme, message, party/field, condition, outcome, severity and corrective guidance.
- **BR-012:** The platform shall determine applicability using scenario attributes including bank, rail, scheme, message type, version, channel, geography and execution date.
- **BR-013:** The platform shall support exceptions and stricter bank overlays without modifying the underlying scheme rule.
- **BR-014:** The platform shall explain why a rule applies and cite the exact source reference available to the platform.
- **BR-015:** The platform shall support comparison of two or more profiles against one payment scenario.

### 8.3 Change intelligence and impact

- **BR-020:** The platform shall identify additions, removals and modifications between rule versions.
- **BR-021:** The platform shall map a changed rule to affected schemes, messages, fields, channels, systems, clients and tests.
- **BR-022:** The platform shall create a review item for material changes and assign an accountable owner.
- **BR-023:** The platform shall issue targeted notifications only to audiences affected by the change.
- **BR-024:** The platform shall retain the impact decision, rationale, reviewer and timestamp.

### 8.4 Bank-profile management

- **BR-030:** Authorized bank users shall define additional requirements by product, channel and message version.
- **BR-031:** Bank overlays shall reference the scheme baseline they extend or restrict.
- **BR-032:** The platform shall detect conflicts between a bank overlay and its selected scheme baseline.
- **BR-033:** Each profile version shall have an owner, approval status, effective period and release notes.
- **BR-034:** Published profiles shall be available to entitled corporate clients and validation services.

### 8.5 Validation and testing

- **BR-040:** Users shall validate supported ISO 20022 messages against syntax, schema, scheme and bank-profile rules.
- **BR-041:** Each finding shall include severity, path, observed value, expected condition, corrective action and source.
- **BR-042:** The platform shall distinguish errors, warnings and informational guidance.
- **BR-043:** Validation shall never submit or execute a payment.
- **BR-044:** Users shall be able to save a validation result as evidence for a client test cycle.
- **BR-045:** The platform shall support positive, negative, boundary and effective-date test cases.

### 8.6 White-label client readiness

- **BR-050:** A bank shall configure portal name, logo, colors, support contact and client guidance.
- **BR-051:** A bank shall segment clients by affected scheme, channel, file format, volume, risk and readiness.
- **BR-052:** Each client shall receive only applicable requirements, tasks and test cases.
- **BR-053:** A client shall acknowledge guidance, submit test evidence and view outstanding actions.
- **BR-054:** Bank users shall review client results, request remediation, approve exceptions and record readiness.
- **BR-055:** The platform shall support readiness states: not assessed, impacted, contacted, acknowledged, testing, remediation, ready, exception approved and overdue.

### 8.7 Reporting and evidence

- **BR-060:** Dashboards shall report readiness by client, portfolio, scheme, channel, message and deadline.
- **BR-061:** Reports shall show current and historical readiness without rewriting prior evidence after a rule update.
- **BR-062:** Audit users shall retrieve the rule version and profile used for any stored validation result.
- **BR-063:** Authorized users shall export management and audit reports.
- **BR-064:** The platform shall record user, configuration, rule, validation and workflow actions in an immutable audit trail.

### 8.8 Integration

- **BR-070:** The platform shall expose APIs for profile discovery, scenario applicability and message validation.
- **BR-071:** Enterprise deployments shall support secure bulk-file ingestion without exposing data across tenants.
- **BR-072:** The platform shall integrate with bank identity providers using OIDC/SAML-compatible SSO.
- **BR-073:** Notification integrations shall support email and configurable enterprise channels.
- **BR-074:** Integration errors shall be retriable, observable and traceable using correlation identifiers.

## 9. Target business processes

### 9.1 Rule-change lifecycle

1. Register a new or changed authoritative source.
2. Compare it with the active source version.
3. Draft normalized rule changes.
4. Review the interpretation and impact.
5. Approve the rule/profile release.
6. Notify affected owners and clients.
7. Revalidate relevant tests and evidence.
8. Monitor readiness until closure.

### 9.2 Corporate-client migration lifecycle

1. Determine which clients are affected.
2. Assign relationship and technical owners.
3. Publish bank-specific guidance and due dates.
4. Capture acknowledgement.
5. Execute file tests.
6. Create remediation actions from findings.
7. Retest and review evidence.
8. Mark ready or approve a time-bound exception.
9. Monitor production indicators after cutover.

## 10. Business rules

- **RB-001:** A production rule must have at least one authoritative or bank-approved source.
- **RB-002:** Publication date and effective date are distinct values.
- **RB-003:** A newer publication does not automatically supersede an active rule; an explicit relationship is required.
- **RB-004:** Rule applicability is evaluated using the payment's relevant execution/settlement context, not only the file-upload timestamp.
- **RB-005:** A stricter bank rule may add constraints but must be visibly separated from the scheme baseline.
- **RB-006:** A deferred authority rule remains visible in history but is not enforced after its deferral date unless another authority still requires it.
- **RB-007:** A client cannot be marked ready while mandatory test cases are failed or incomplete unless an authorized exception exists.
- **RB-008:** An exception must have scope, reason, approver, compensating action and expiry date.
- **RB-009:** Validation findings shall be reproducible using the stored rule-set version.
- **RB-010:** Automated extraction may propose rules but cannot approve or publish them.

## 11. Non-functional business requirements

| Area | Requirement |
|---|---|
| Security | Least-privilege access, tenant isolation, encryption in transit/at rest and auditable administration |
| Privacy | Data minimization, configurable retention, masking and no reuse of client payment data for model training without explicit agreement |
| Explainability | Deterministic production validation and source-linked findings |
| Availability | Target service levels defined per deployment tier; validation APIs designed for high availability |
| Performance | Interactive validations should return within a user-acceptable response time; bulk SLAs configured by file size and tier |
| Scalability | Horizontal scaling for stateless validation and reporting workloads |
| Accessibility | Target WCAG 2.2 AA for bank and corporate web experiences |
| Localization | Locale-ready UI, time zones, date formats and country-specific address practices |
| Auditability | Append-only evidence trail and reproducible versioned results |
| Portability | SaaS and bank-managed deployment options without coupling rule content to one runtime |

## 12. KPIs

- Percentage of active rules with approved source traceability.
- Mean time from source publication to impact decision.
- Number and value of payments/files at risk by deadline.
- Percentage of in-scope clients acknowledged, testing and ready.
- First-pass validation success rate.
- Rule-related reject rate before and after adoption.
- Average remediation cycle time.
- Number of expired or overdue exceptions.
- Percentage of bank profiles revalidated after a material scheme change.
- Monthly active bank and corporate users.

## 13. Assumptions and dependencies

- Scheme and bank documents are legally accessible for the intended use.
- Banks remain accountable for approving their internal interpretation.
- Bank-specific implementation guides may be incomplete or non-public.
- Corporate clients provide representative test files and accurate scenario information.
- Production deployment requires customer-specific security, data-residency and retention decisions.
- The address-format timeline remains a changeable rule and must not be hard-coded as an immutable platform assumption.

## 14. Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Incorrect rule interpretation | Dual review, source citation, approval workflow and effective-dated rollback |
| Stale guidance after an announcement | Automated monitoring plus mandatory human triage and targeted alerts |
| False promise of bank acceptance | Clearly separate schema, scheme, bank-profile, channel and entitlement checks |
| Sensitive payment-data exposure | Local/client-side demo processing; enterprise encryption, isolation, masking and retention controls |
| Scope becoming a payment hub | Preserve validation/readiness boundary and integration-first architecture |
| Slow bank sales cycle | Offer a fixed-scope readiness assessment and pilot before annual platform licensing |
| Deadline-specific product obsolescence | Extend the normalized rule model to new data and payment obligations |

## 15. Commercial model

1. **Readiness assessment:** fixed-scope service using RuleRail to assess rules, clients, channels and payment files.
2. **White-label bank licence:** annual platform subscription based on institution size, client population and environments.
3. **Corporate/ERP subscription:** access to multibank comparison, profile APIs and validation volumes.
4. **Enterprise integration:** implementation, bank-profile configuration and managed rule-content services.

## 16. MVP business acceptance criteria

The public MVP is accepted when a user can:

1. View current EPC and Swift address-rule status with source links and uncertainty labels.
2. Compare at least three fictional bank profiles for one payment scenario.
3. Validate a sample XML message and receive reproducible, source-linked findings.
4. View and update fictional corporate-client readiness states.
5. See the impact of a selected rule change on clients, systems and messages.
6. Preserve demo changes in the same browser and reset them safely.
7. Use the core workflows on desktop and mobile without horizontal page overflow.
8. Understand that the product validates and coordinates readiness but does not process payments.

