---
name: employee-offboarding
description: Execute an authorized access-removal and asset handoff checklist for an employee departure.
inputs:
  offboardingId: string
  employeeRecordRef: string
  authorizationRef: string
  effectiveAt: datetime
  offboardingPolicyRef: string
steps:
  - id: scope_departure
    agent: |
      Read the departure authorization and offboarding policy in the restricted HR system.
      List accounts, active sessions, assets, data custodians and preservation requirements.
      Confirm the effective time and time zone against authorization; escalate conflicts.
      Create a checklist with system owners and evidence requirements. Exclude departure reasons from run data.
    output:
      checklistRef: string
      preservationPlanRef: string
    evidence:
      - link
    next: authorize_execution
  - id: authorize_execution
    person: offboarding-authorizer
    approve: |
      Inspect the departure authorization, effective time and complete checklist.
      Confirm access-removal scope, preservation obligations and authorized system owners.
      Reject unclear timing, unapproved deletion or missing ownership.
    on_reject: scope_departure
    next: remove_access
  - id: remove_access
    person: identity-administrator
    task: |
      Execute the approved checklist at its authorized effective time.
      Check current account and session state using employeeRecordRef and offboardingId before each action.
      Revoke approved access and sessions. Preserve records according to the approved plan.
      Read back results from every listed system; record removal times and residual access.
      Escalate residual access immediately to the authorizer; do not report completion until resolved.
    output:
      revocationRecordRef: string
      verifiedAt: datetime
    evidence:
      - link
    next: transfer_custody
  - id: transfer_custody
    person: offboarding-coordinator
    task: |
      Read the approved checklist and preservation plan.
      Transfer authorized data custody and reconcile equipment return or approved recovery arrangements.
      Search existing handoff records by offboardingId before creating transfer or recovery requests.
      Read back new custodians and asset states. Record explicitly authorized asset exceptions with owners.
      Do not delete preserved data. Escalate failed transfers or missing preservation instructions.
    output:
      custodyRecordRef: string
      assetRecordRef: string
      exceptionRef: string
    evidence:
      - link
    next: accept_checklist
  - id: accept_checklist
    person: offboarding-authorizer
    approve: |
      Inspect per-system access read-back, custody records and asset reconciliation.
      Require revoked in-scope access and completed preservation requirements.
      Accept only documented asset exceptions with authorized owners and follow-up arrangements.
      Reject incomplete verification; refresh affected evidence after rework without restoring revoked access.
    on_reject: scope_departure
    next: completed
  - id: completed
    finish: access_and_custody_closed
---
# Employee offboarding

An adaptable starter template. Configure policies, role bindings and a supervised pilot before live use.

## Purpose and completion
Give the accountable departure authorizer evidence of access removal and custody reconciliation.
`access_and_custody_closed` requires verified in-scope revocation, preserved records and reconciled assets.
Assets may remain under an explicitly accepted recovery arrangement; completion does not mean every asset was physically returned.

## Start and scope
Start from an authorized departure record with an effective time and identified employee.
Cover access, session revocation, preservation, data custody and equipment reconciliation.
Exclude the employment decision, payroll settlement and legal interpretation.
This sequential template is unsuitable for emergency simultaneous revocation unless adapted and tested for that requirement.

## Ownership and resources
The people-operations owner coordinates the checklist. The offboarding authorizer holds the organization's departure authority.
Identity administrators perform security changes. The coordinator manages authorized custody and asset records.

Marketplace fit: Teams needing a traceable departure checklist across HR, identity and equipment systems.

## Before adoption
- Bind authorizer, identity administrator and coordinator to people with appropriate authority.
- Supply authoritative HR, identity, asset and data-custody systems and supported read-back methods.
- Confirm departure timing, preservation, privacy, session revocation and asset-exception policies.
- Define urgent-response routing and the system inventory needed to avoid omitted access.
- Set follow-up ownership, service expectations and a supervised pilot with simulated revocations.

## Exceptions and recovery
Before each external write, booking or message, recheck the current run, source request and authority. Stop and involve the owner if the request was withdrawn, the run ended or permission changed. A read-before-action check does not provide an atomic cancellation interlock; use the source system’s controls for consequential actions.
Missing authorization blocks execution. The authorizer resolves timing and scope conflicts.
For unknown action results, inspect current system state by employeeRecordRef and offboardingId before retrying.
Record partial revocations and have administrators finish remaining systems; do not re-enable access during ordinary rework.
If an incorrect revocation needs restoration, require fresh authorization through the organization's security procedure.
Use a reference stating that no asset exceptions exist when exceptionRef has no applicable exception record.
Repeated rejection or unavailable critical systems requires operator intervention and the adopted incident procedure.
Cancellation does not reverse revocations or preservation actions.

## Measures and review
Measure departures with verified removal of all inventoried access using revocation records and reviewer decisions.
Measure elapsed time between effectiveAt and verifiedAt, including early or late execution deviations.
The owner sets measurement windows and targets and reviews inventory gaps after each pilot and material system change.

## Rehearsal cases
- Normal departure: all access is revoked; custody and assets reconcile before acceptance.
- Conflicting effective times: scope preparation escalates before any account changes.
- Revocation response is lost: read back account and session state before repeating an action.
- Device remains outstanding: authorizer accepts an owned recovery arrangement or rejects closure; access stays revoked.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  scope_departure("Scope departure<br/>Agent"):::agent
  authorize_execution{{"Authorize execution<br/>Approval: offboarding-authorizer"}}:::person
  remove_access["Remove access<br/>Person: identity-administrator"]:::person
  transfer_custody["Transfer custody<br/>Person: offboarding-coordinator"]:::person
  accept_checklist{{"Accept checklist<br/>Approval: offboarding-authorizer"}}:::person
  completed(["Access and custody closed"]):::outcome
  scope_departure --> authorize_execution
  authorize_execution -->|"Approved"| remove_access
  authorize_execution -.->|"Rejected"| scope_departure
  remove_access --> transfer_custody
  transfer_custody --> accept_checklist
  accept_checklist -->|"Approved"| completed
  accept_checklist -.->|"Rejected"| scope_departure
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
