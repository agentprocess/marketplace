---
name: weekly-planning
description: Turn commitments and priorities into a realistic weekly plan, then verify it is recorded in your calendar or planner.
inputs:
  weekOf: date
  commitmentsReference: string
  prioritiesReference: string
  availableHours: number
steps:
  - id: draft_week
    agent: Read the supplied commitments and priorities for weekOf. Confirm availableHours is nonnegative and represents discretionary capacity after fixed commitments. If its meaning is unclear, escalate. Identify deadlines, fixed appointments and dependencies. Propose a small achievable set of outcomes within capacity, with buffers and explicit tradeoffs. Do not change calendars or notify anyone.
    output:
      proposedPlan: string
      estimatedHours: number
      conflicts:
        type: list
        items: string
      deferredItems:
        type: list
        items: string
  - id: choose_plan
    person: initiator
    task: Review the proposal against your actual energy, obligations and available hours. Resolve conflicts, choose outcomes and time blocks, and explicitly defer excess work. Record the final plan. Choose record_plan only when the plan fits capacity and fixed commitments. Choose deferred when you do not want to commit this week.
    output:
      finalPlan: string
      decisionReason: string
    next:
      - to: record_plan
        when: The person accepts a feasible plan
      - to: deferred
        when: The person defers planning without committing
  - id: record_plan
    person: initiator
    task: Save the accepted plan in your chosen planner or calendar. Inspect existing entries for weekOf before creating or changing anything. Do not overwrite unrelated appointments or send invitations without intent. Read back the saved entries and check dates, time zones and durations. Keep this task open if saving or conflict resolution is incomplete.
    output:
      plannerReference: string
      verificationSummary: string
    evidence:
      - link
    next: planned
  - id: deferred
    finish: planning_deferred
  - id: planned
    finish: week_planned
---
# Weekly planning

Marketplace fit: Individuals, freelancers and busy parents who want an achievable week rather than a longer task list.

## Purpose and scope
Start once for a selected week when commitments and priorities are available. Completion means a feasible plan is saved and checked; it does not mean the week's work is finished. The initiator owns and accepts the plan.

## Before adoption
- Start as a person because tasks use initiator; no other role bindings are needed.
- Choose a private planner and grant only the access you intend. Supply references to commitments and priorities.
- Define discretionary available hours, include care/rest commitments, and agree how estimates and buffers are handled.
- This is an adaptable template. Rehearse with sample data before any live calendar edits.

## Exceptions and recovery
Unavailable calendar information or unclear priorities goes back to the person through escalation. Inspect saved entries after an interrupted write; do not duplicate blocks. A changed commitment requires reviewing the affected plan, not erasing unrelated work. Deferral leaves the calendar unchanged.

## Measures and review
Track the share of planned outcomes completed or consciously renegotiated, and the time spent planning. Review actual capacity at the next weekly run; set personal targets only after observing a baseline.

## Rehearsal cases
- Capacity is ample: select the plan, save it, and verify entries.
- Commitments exceed capacity: defer work or choose planning_deferred.
- An interrupted calendar save already created entries: reuse them without duplication.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  draft_week("Draft week<br/>Agent"):::agent
  choose_plan["Choose plan<br/>Person: initiator"]:::person
  record_plan["Record plan<br/>Person: initiator"]:::person
  deferred(["Planning deferred"]):::outcome
  planned(["Week planned"]):::outcome
  draft_week --> choose_plan
  choose_plan -->|"The person accepts a feasible plan"| record_plan
  choose_plan -->|"The person defers planning without committing"| deferred
  record_plan --> planned
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
