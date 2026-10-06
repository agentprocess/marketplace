---
name: project-kickoff
description: Agree a project charter, prepare its workspace and hand off an accepted kickoff record.
inputs:
  projectId: string
  requestRef: string
  sponsor: person
  projectPolicyRef: string
steps:
  - id: draft_charter
    agent: |
      Read the project request and supplied project policy.
      Draft objectives, deliverables, exclusions, dependencies, decision rights, risks and proposed milestones.
      Identify owners and unresolved resource assumptions. Do not invent approved budgets or delivery commitments.
      Escalate missing sponsorship or contradictory requirements.
    output:
      charterRef: string
      openDecisions: list
    evidence:
      - link
    next: approve_charter
  - id: approve_charter
    person: inputs.sponsor
    approve: |
      Inspect the charter and open decisions. Confirm scope, accountable lead and resource authority.
      Require resolved blocking decisions and explicit owners for permitted assumptions.
      Reject unsupported commitments or missing success criteria.
    on_reject: draft_charter
    next: prepare_workspace
  - id: prepare_workspace
    person: project-lead
    task: |
      Read the approved charter. Find existing workspace and tracker records using projectId.
      Create or update the authorized workspace, initial work items and decision log.
      Apply the approved membership and read back access, item owners and project references.
      Record setup evidence. Escalate unavailable systems or unapproved access requests.
    output:
      workspaceRef: string
      workPlanRef: string
      setupVerificationRef: string
    evidence:
      - link
    next: conduct_kickoff
  - id: conduct_kickoff
    person: project-lead
    task: |
      Share the approved charter with authorized participants and conduct the kickoff discussion.
      Reconcile existing invitations by projectId before sending or updating them; read back recipients and status.
      Confirm responsibilities with each owner. Record decisions, risks and unresolved objections.
      Mark proposed scope changes for sponsor decision; do not treat discussion as budget approval.
    output:
      kickoffRecordRef: string
      actionRegisterRef: string
    evidence:
      - link
    next: accept_handoff
  - id: accept_handoff
    person: inputs.sponsor
    approve: |
      Inspect the kickoff record, owner commitments and workspace verification.
      Confirm the charter remains accurate and blocking objections are resolved.
      Reject unapproved scope changes or unowned delivery responsibilities.
      Require affected records and participant commitments to be refreshed after rework.
    on_reject: draft_charter
    next: ready
  - id: ready
    finish: project_kickoff_accepted
---
# Project kickoff

An adaptable starter template. Configure organizational policies and run a supervised pilot before live use.

## Purpose and completion
Give the sponsor and project lead an accepted charter, working project space and recorded kickoff agreements.
`project_kickoff_accepted` means the sponsor accepted that handoff. It does not mean delivery has started or finished.

## Start and scope
Start with a sponsored request for a project and a stable projectId.
Cover charter agreement, workspace preparation and kickoff decisions.
Exclude procurement, staffing contracts and execution of project deliverables; route those through their approved processes.

## Ownership and resources
The project-management owner maintains the process. The sponsor authorizes scope and accepts kickoff readiness.
The project lead manages workspace setup, participant commitments and the delivery handoff.

Marketplace fit: Cross-functional teams turning an approved initiative into a shared scope and accountable work plan.

## Before adoption
- Bind sponsor and project-lead roles with documented scope and resource authority.
- Supply charter, approval, collaboration-access and change-control policies.
- Choose authoritative document, project-tracker and calendar systems with readable evidence links.
- Grant permissions for workspace setup and invitations; agree accepted resource and milestone units.
- Set service expectations and pilot acceptance criteria with the intended delivery team.

## Exceptions and recovery
Before each external write, booking or message, recheck the current run, source request and authority. Stop and involve the owner if the request was withdrawn, the run ended or permission changed. A read-before-action check does not provide an atomic cancellation interlock; use the source system’s controls for consequential actions.
Escalate missing sponsorship, conflicting commitments or unavailable systems to the project-management owner.
Search by projectId before repeating workspace, task or invitation writes; read back actual target state.
Reuse existing records after rejection and refresh changed memberships, milestones and participant commitments.
Remove incorrect access through authorized administrators. Record any approved compensation for unintended external changes.
Repeated rejection goes to the owner for an operator decision; do not loop indefinitely.
If the project is withdrawn, an operator cancels the run and arranges separate workspace cleanup.

## Measures and review
Measure kickoff handoffs accepted without unresolved blocking ownership or scope gaps from approval and decision records.
Measure request-to-kickoff acceptance time and approval waiting time from run timestamps.
The owner agrees measurement windows, baselines and targets before piloting and reviews material policy changes.

## Rehearsal cases
- Normal project: approved charter, verified workspace and owner commitments lead to acceptance.
- Budget is only a proposal: sponsor rejects the charter until authority and assumptions are explicit.
- Workspace creation response is lost: find projectId and reuse the workspace after access read-back.
- Kickoff changes scope: reject handoff, revise the charter and refresh affected commitments before acceptance.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  draft_charter("Draft charter<br/>Agent"):::agent
  approve_charter{{"Approve charter<br/>Approval: inputs.sponsor"}}:::person
  prepare_workspace["Prepare workspace<br/>Person: project-lead"]:::person
  conduct_kickoff["Conduct kickoff<br/>Person: project-lead"]:::person
  accept_handoff{{"Accept handoff<br/>Approval: inputs.sponsor"}}:::person
  ready(["Project kickoff accepted"]):::outcome
  draft_charter --> approve_charter
  approve_charter -->|"Approved"| prepare_workspace
  approve_charter -.->|"Rejected"| draft_charter
  prepare_workspace --> conduct_kickoff
  conduct_kickoff --> accept_handoff
  accept_handoff -->|"Approved"| ready
  accept_handoff -.->|"Rejected"| draft_charter
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
