---
name: employee-onboarding
description: Prepare and verify an approved employee workspace and first-week handoff.
inputs:
  onboardingId: string
  employeeRecordRef: string
  manager: person
  startDate: date
  roleRequirementsRef: string
  onboardingPolicyRef: string
steps:
  - id: prepare_plan
    agent: |
      Read the employee record, role requirements and onboarding policy.
      Confirm the approved start date with the manager. Keep personal documents in HR systems.
      Draft a checklist of accounts, equipment, training and first-week contacts.
      Identify required entitlements and item owners. Escalate missing employment approval or unclear access policy.
    output:
      planRef: string
      entitlementRef: string
      firstWeekRef: string
    evidence:
      - link
    next: approve_plan
  - id: approve_plan
    person: inputs.manager
    approve: |
      Inspect the plan, entitlements and start date against the approved role.
      Confirm each action has an authorized owner and an acceptable execution time.
      Reject excessive access, missing training or incomplete first-week arrangements.
    on_reject: prepare_plan
    next: prepare_workspace
  - id: prepare_workspace
    parallel:
      - provision_access
      - prepare_equipment
    next: accept_workspace
  - id: provision_access
    person: identity-administrator
    task: |
      Read the approved entitlement list. Provision only those accounts at the authorized time.
      Search by onboardingId and employee record before creating accounts or repeating changes.
      Read back assigned entitlements and account state from each identity system.
      Record account references and discrepancies without recording credentials.
      Escalate partial provisioning; resolve or obtain an approved exception before submission.
    output:
      accessRecordRef: string
      verificationRef: string
    evidence:
      - link
    next: join
  - id: prepare_equipment
    person: workplace-coordinator
    task: |
      Read the approved equipment checklist. Reserve and prepare the authorized items.
      Search existing allocations by onboardingId before placing requests or reserving stock.
      Read back asset assignments and record delivery arrangements in the equipment system.
      Escalate unavailable equipment and obtain an approved alternative before submission.
    output:
      allocationRef: string
      deliveryPlanRef: string
    evidence:
      - link
    next: join
  - id: accept_workspace
    person: inputs.manager
    approve: |
      Inspect access read-back, equipment allocations and the first-week plan.
      Confirm the employee has usable arrangements for the agreed start date.
      Reject unresolved blockers. On rework, require updated verification and reuse existing allocations.
    on_reject: prepare_plan
    next: ready
  - id: ready
    finish: workspace_ready
---
# Employee onboarding

An adaptable starter template. Configure it and run a supervised pilot before live use.

## Purpose and completion
Give the employee and manager a verified workspace preparation record and first-week plan.
`workspace_ready` means the manager accepted access, equipment arrangements and the plan.
It does not establish completed employment paperwork, delivered training or employee attendance.

## Start and scope
Start after employment approval and an authoritative employee record exist.
Use one onboardingId per employee start. Exclude offer negotiation, payroll enrollment and sensitive document collection.
Hand unresolved employment prerequisites to HR before starting this workflow.

## Ownership and resources
The people-operations owner maintains this process. The manager approves role requirements and accepts readiness.
Identity administrators control account changes; workplace coordinators control asset allocations.
The two preparation branches are independent after approval. Both must finish before acceptance.

Marketplace fit: Small and growing teams coordinating HR, IT and workplace preparation across existing systems.

## Before adoption
- Bind all roles to authorized people and confirm parallel-1 support.
- Choose authoritative HR, identity, asset and checklist systems with reviewer-readable evidence links.
- Supply access, employment approval, equipment, privacy and timing policies; define exception authority.
- Grant least-privilege access and agree which changes need additional local approvals.
- Set service expectations, pilot cases and the manager's acceptance criteria.

## Exceptions and recovery
Before each external write, booking or message, recheck the current run, source request and authority. Stop and involve the owner if the request was withdrawn, the run ended or permission changed. A read-before-action check does not provide an atomic cancellation interlock; use the source system’s controls for consequential actions.
Escalate missing records or conflicting start dates to the people-operations owner.
Use onboardingId plus employee record to reconcile each external action before retrying.
If an account or allocation exists, update or reuse it; never create a duplicate to clear a failed attempt.
Remove incorrect access through an authorized administrator and record the correction.
A rejection refreshes affected records and approvals; repeated rejection goes to the owner for operator intervention.
An operator handles cancellation, including external account or asset cleanup; a run cancellation does not undo changes.

## Measures and review
Track manager-accepted readiness without rework from approval history and preparation records.
Track start-to-acceptance elapsed time and branch waiting time from run timestamps.
The owner sets the measurement window, baseline and targets before piloting; review after policy or system changes.

## Rehearsal cases
- Normal start: both preparation branches complete; the manager accepts workspace readiness.
- Excessive entitlement: manager rejects the plan; corrected access receives fresh approval.
- Account write response is lost: reconcile the employee account, then record read-back without duplication.
- Equipment is unavailable: escalate an alternative; prevent acceptance while the start arrangement remains blocked.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  prepare_plan("Prepare plan<br/>Agent"):::agent
  approve_plan{{"Approve plan<br/>Approval: inputs.manager"}}:::person
  prepare_workspace[["Prepare workspace<br/>Parallel"]]:::flow
  provision_access["Provision access<br/>Person: identity-administrator"]:::person
  prepare_equipment["Prepare equipment<br/>Person: workplace-coordinator"]:::person
  join_prepare_workspace{"All branches complete"}:::flow
  accept_workspace{{"Accept workspace<br/>Approval: inputs.manager"}}:::person
  ready(["Workspace ready"]):::outcome
  prepare_plan --> approve_plan
  approve_plan -->|"Approved"| prepare_workspace
  approve_plan -.->|"Rejected"| prepare_plan
  prepare_workspace --> provision_access
  prepare_workspace --> prepare_equipment
  join_prepare_workspace --> accept_workspace
  provision_access --> join_prepare_workspace
  prepare_equipment --> join_prepare_workspace
  accept_workspace -->|"Approved"| ready
  accept_workspace -.->|"Rejected"| prepare_plan
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
