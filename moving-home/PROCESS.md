---
name: moving-home
description: Coordinate a household move, complete packing and address arrangements, and verify the agreed handover.
inputs:
  moveDate: date
  moveScopeReference: string
  addressReference: string
  budgetReference: string
steps:
  - id: prepare_move
    agent: Read the move scope, private address reference and budget. Build a dated checklist of transport, packing, access, utilities and agreed handovers. Identify dependencies, accessibility needs and provider cancellation terms. Use current provider information when checking services. Escalate missing dates, access or authority; do not book anything.
    output:
      movePlan: string
      openDecisions:
        type: list
        items: string
  - id: arrange_move
    person: initiator
    task: Resolve the open decisions and confirm lawful access to both locations. Select transport and any helpers within your own budget. Inspect existing bookings before committing. Record provider confirmations, agreed arrival window and the handover checklist. Choose prepare_household only when arrangements are feasible; otherwise choose postponed before further work.
    output:
      arrangementReference: string
      handoverChecklist: string
      decisionReason: string
    evidence:
      - link
    next:
      - to: prepare_household
        when: Transport and access are confirmed
      - to: postponed
        when: The move is postponed
  - id: prepare_household
    parallel:
      - pack_inventory
      - address_arrangements
    next: complete_handover
  - id: pack_inventory
    person: initiator
    task: Pack the agreed inventory, label essential items and record items needing special handling. Check transport restrictions with the chosen provider. Keep identity documents and valuables out of shared run data. Verify all items in scope are packed or have an agreed handling plan.
    output:
      inventoryReference: string
      packingSummary: string
    evidence:
      - link
    next: join
  - id: address_arrangements
    person: initiator
    task: Using the agreed move plan, arrange the applicable utility and address changes directly with authorized providers. Confirm effective dates and keep receipts. Do not disclose the new address to unrelated recipients. Record any service that remains pending and its owner; complete only when the move-critical arrangements are confirmed.
    output:
      arrangementsReference: string
      pendingFollowUp: string
    evidence:
      - link
    next: join
  - id: complete_handover
    person: initiator
    task: Carry out the move using the confirmed arrangements. Check inventory on arrival and inspect the agreed access and key handovers. Record damage, missing items and noncritical follow-up with an owner. Keep this task open while a move-critical handover remains incomplete. Verify the household and all move-critical inventory are at the destination before completing. The initiator must explicitly accept each remaining noncritical inventory exception with its recovery owner and next action.
    output:
      handoverReference: string
      exceptionsAndOwners: string
      completedAt: datetime
    evidence:
      - link
    next: moved
  - id: postponed
    finish: move_postponed
  - id: moved
    finish: move_handover_complete
---
# Moving home

Marketplace fit: Households coordinating transport, packing and utility changes across a single move.

## Purpose and scope
The initiator owns the move. Start after choosing the intended date and defining locations in a private reference. Completion means the agreed physical move and critical handovers are verified, with remaining minor issues assigned. Property purchase, tenancy negotiations and legal advice are outside scope.

## Before adoption
- Start as a person and use a server supporting parallel-1. The same person may complete both preparation branches at different times.
- Define the inventory, access rights, budget, critical handover criteria and any helper/provider responsibilities.
- Keep full addresses, identification and payment details in private source systems.
- Confirm provider availability and terms for the real move. Rehearse this template before bookings or address changes.

## Exceptions and recovery
Postponement does not refund or cancel existing bookings: the initiator reconciles them with providers. Changes during preparation require coordinated updates to both branches and the move plan. Core cancellation stops the run, not a moving vehicle or utility order. Inspect booking and service records before repeating an uncertain action.

## Measures and review
Track critical handovers completed on the agreed date and unresolved inventory issues. Track elapsed time from arrangements to completion. Review damage or missed dependencies before reusing the checklist.

## Rehearsal cases
- Transport and access confirmed: both branches join before handover.
- Transport unavailable: postponed outcome; reconcile any existing bookings.
- Utility request response lost: inspect provider state instead of requesting twice.
- An essential item is missing: keep handover open and resolve it before completion.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  prepare_move("Prepare move<br/>Agent"):::agent
  arrange_move["Arrange move<br/>Person: initiator"]:::person
  prepare_household[["Prepare household<br/>Parallel"]]:::flow
  pack_inventory["Pack inventory<br/>Person: initiator"]:::person
  address_arrangements["Address arrangements<br/>Person: initiator"]:::person
  join_prepare_household{"All branches complete"}:::flow
  complete_handover["Complete handover<br/>Person: initiator"]:::person
  postponed(["Move postponed"]):::outcome
  moved(["Move handover complete"]):::outcome
  prepare_move --> arrange_move
  arrange_move -->|"Transport and access are confirmed"| prepare_household
  arrange_move -->|"The move is postponed"| postponed
  prepare_household --> pack_inventory
  prepare_household --> address_arrangements
  join_prepare_household --> complete_handover
  pack_inventory --> join_prepare_household
  address_arrangements --> join_prepare_household
  complete_handover --> moved
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
