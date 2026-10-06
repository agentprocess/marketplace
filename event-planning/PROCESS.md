---
name: event-planning
description: Approve an event plan, verify authorized arrangements and hand off an accepted readiness pack.
inputs:
  eventId: string
  eventBriefRef: string
  sponsor: person
  eventDate: date
  eventPolicyRef: string
steps:
  - id: draft_event_plan
    agent: |
      Read the event brief and policy. Confirm intended audience, date, capacity and available budget authority.
      Draft the agenda, venue or platform needs, accessibility arrangements, staffing and contingency plan.
      List proposed costs with currency and source dates; distinguish estimates from approved commitments.
      Identify required approvals and booking owners. Escalate missing safety or accessibility requirements.
    output:
      planRef: string
      costPlanRef: string
      contingencyRef: string
    evidence:
      - link
    next: approve_plan
  - id: approve_plan
    person: inputs.sponsor
    approve: |
      Inspect the plan, costs, required local approvals and contingency arrangements.
      Confirm audience, scope and who may commit funds or contact participants.
      Reject unsupported budgets, missing required approvals or unresolved accessibility and safety requirements.
    on_reject: draft_event_plan
    next: secure_arrangements
  - id: secure_arrangements
    person: event-coordinator
    task: |
      Read the approved plan and book only arrangements within the granted authority.
      Obtain separate purchasing or contract approval wherever the supplied policy requires it.
      Search bookings and purchase records by eventId before committing or retrying any transaction.
      Read back booking dates, capacity, costs, currency, cancellation terms and confirmation IDs.
      Confirm staffing and accessibility arrangements. Escalate unavailable suppliers or changed terms before accepting them.
    output:
      arrangementsRef: string
      commitmentsRef: string
    evidence:
      - link
    next: prepare_readiness_pack
  - id: prepare_readiness_pack
    agent: |
      Read approved plans and confirmed arrangements. Reconcile dates, capacities and commitments with the event brief.
      Prepare the run sheet, staff contacts, approved participant communication draft and contingency activation instructions.
      Record remaining dependencies and their owners. Keep private attendee information in its authorized system.
      Escalate gaps that would prevent delivery; do not label unconfirmed bookings as ready.
    output:
      readinessPackRef: string
      openDependencies: list
    evidence:
      - link
    next: accept_readiness
  - id: accept_readiness
    person: inputs.sponsor
    approve: |
      Inspect the readiness pack against confirmed bookings and policy-required approvals.
      Require resolved delivery blockers and explicit owners for any accepted nonblocking dependencies.
      Confirm the coordinator can execute the run sheet and contingency plan.
      Reject unverified arrangements; rework must refresh commitments and obtain approval for changed costs or scope.
    on_reject: draft_event_plan
    next: ready
  - id: ready
    finish: event_ready
---
# Event planning

An adaptable starter template. Configure event-specific policy and run a supervised pilot before live use.

## Purpose and completion
Give the event sponsor and coordinator an approved readiness pack backed by confirmed arrangements.
`event_ready` means the sponsor accepted readiness for the planned event.
It does not mean invitations were sent, the event took place or post-event reconciliation finished.

## Start and scope
Start from an authorized event brief with an eventId, sponsor and proposed event date.
Cover planning, approved bookings, staffing and readiness acceptance.
Exclude event delivery, attendee registration operations, participant message sending and post-event accounting.
Use separate authorized procurement or contract processes where policy requires them.

## Ownership and resources
The events owner maintains this workflow. The sponsor approves scope, spending authority and readiness.
The event coordinator handles permitted bookings and delivery handoff; purchasing authorities retain contract approval rights.

Marketplace fit: Operations teams planning internal, community or customer events using their existing booking and procurement systems.

## Before adoption
- Bind sponsor, coordinator and required purchasing authorities to authorized people.
- Supply event, spending, contract, cancellation, accessibility, privacy and safety requirements applicable to the event.
- Choose authoritative booking, procurement, staffing and document systems with readable confirmation records.
- Grant booking permissions and define approval limits, accepted dependencies and contingency decision authority.
- Agree planning service expectations, readiness criteria and a supervised pilot with simulated purchases.

## Exceptions and recovery
Before each external write, booking or message, recheck the current run, source request and authority. Stop and involve the owner if the request was withdrawn, the run ended or permission changed. A read-before-action check does not provide an atomic cancellation interlock; use the source system’s controls for consequential actions.
Escalate uncertain policy, unavailable venues or changed commercial terms to the sponsor before committing.
Reconcile external actions by eventId and confirmation ID before retrying; read back the supplier or platform record.
On rejection, reuse confirmed bookings and update only authorized changes. Check cancellation costs before modifying commitments.
The coordinator requests authorized cancellation or compensation for mistaken bookings and records the outcome.
Cancellation of a run does not cancel supplier commitments; an operator must assign that cleanup explicitly.
Repeated rejection or a delivery blocker near the event date requires a sponsor decision under the adopted contingency procedure.

## Measures and review
Measure accepted readiness packs without unresolved delivery blockers from acceptance and booking records.
Measure brief-to-readiness elapsed time and time waiting on supplier confirmations from run and booking timestamps.
The events owner sets measurement windows and targets; review after pilots, cancellations and material policy changes.

## Rehearsal cases
- Normal event: bookings, staffing and contingency instructions support sponsor acceptance of event_ready.
- Venue cost exceeds approved authority: coordinator escalates and obtains separate approval before committing.
- Booking response is lost: reconcile eventId with the supplier and record confirmation without purchasing twice.
- Readiness review finds inaccessible arrangements: reject, revise the plan and refresh affected bookings and approval.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  draft_event_plan("Draft event plan<br/>Agent"):::agent
  approve_plan{{"Approve plan<br/>Approval: inputs.sponsor"}}:::person
  secure_arrangements["Secure arrangements<br/>Person: event-coordinator"]:::person
  prepare_readiness_pack("Prepare readiness pack<br/>Agent"):::agent
  accept_readiness{{"Accept readiness<br/>Approval: inputs.sponsor"}}:::person
  ready(["Event ready"]):::outcome
  draft_event_plan --> approve_plan
  approve_plan -->|"Approved"| secure_arrangements
  approve_plan -.->|"Rejected"| draft_event_plan
  secure_arrangements --> prepare_readiness_pack
  prepare_readiness_pack --> accept_readiness
  accept_readiness -->|"Approved"| ready
  accept_readiness -.->|"Rejected"| draft_event_plan
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
