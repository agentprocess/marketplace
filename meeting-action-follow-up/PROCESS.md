---
name: meeting-action-follow-up
description: Confirm meeting actions, reconcile their follow-up status and record accepted closure or an owned handoff.
inputs:
  meetingId: string
  meetingRecordRef: string
  chair: person
  actionPolicyRef: string
steps:
  - id: extract_actions
    agent: |
      Read the meeting record and action policy. Distinguish agreed actions from discussion and proposals.
      Draft an action register with stable action IDs, proposed owners and only explicitly agreed dates.
      Flag uncertain decisions, missing owners and conflicting notes. Do not infer consent from attendance.
    output:
      draftRegisterRef: string
      ambiguities: list
    evidence:
      - link
    next: confirm_actions
  - id: confirm_actions
    person: inputs.chair
    approve: |
      Compare the draft register with the meeting record and resolve each ambiguity with participants.
      Confirm action wording, owner acceptance and any agreed dates.
      Reject invented commitments or unresolved ownership. Confirm explicitly when the meeting has no actions.
    on_reject: extract_actions
    next: publish_actions
  - id: publish_actions
    agent: |
      Read the approved action register. Use the authorized task system to create or update agreed actions.
      Search by meetingId and stable action ID before each write. Read back descriptions, owners and dates.
      Send only policy-authorized notifications to confirmed owners and record delivery status.
      For no actions, record the approved empty register without creating tasks or notifications.
      Escalate unknown write or delivery results before repeating them.
    output:
      registerRef: string
      writeVerificationRef: string
    evidence:
      - link
    next: review_follow_up
  - id: review_follow_up
    person: follow-up-coordinator
    task: |
      Review the published register at the policy-agreed follow-up point.
      Obtain owner updates and inspect completion evidence; do not mark a task complete from a reminder alone.
      Read back current task status. Record completed items, blockers and explicit continuation owners.
      Agree further review arrangements for every open item and record approved changes to dates or ownership.
      For no actions, retain the chair's empty-register confirmation as the review evidence.
    output:
      reviewRef: string
      openActionIds: list
      continuationRef: string
    evidence:
      - link
    next: accept_review
  - id: accept_review
    person: inputs.chair
    approve: |
      Inspect task read-back, completion evidence and continuation arrangements.
      Require every action to be either evidenced as complete or assigned an accepted continuation owner.
      Reject unsupported completion or unowned blockers; repeat follow-up review to correct these gaps.
    on_reject: review_follow_up
    next: classify_result
  - id: classify_result
    agent: |
      Read the accepted review and openActionIds. Select the outcome matching the accepted record.
      Route to closed only when no actions remain open, including an approved empty action register.
      If any action remains open, route to handed_off with its accepted continuation reference.
      Escalate contradictory records instead of inferring completion.
    output:
      acceptedReviewRef: string
    evidence:
      - link
    next:
      - to: closed
        when: The accepted review records no open actions
      - to: handed_off
        when: The accepted review records open actions with accepted continuation owners
  - id: closed
    finish: actions_closed
  - id: handed_off
    finish: follow_up_handed_off
---
# Meeting action follow-up

An adaptable starter template. Set up systems, notification authority and a supervised pilot before live use.

## Purpose and completion
Give the meeting chair an accurate action register and an accepted follow-up review.
`actions_closed` requires evidence that all actions are complete, or approval that the meeting created no actions.
`follow_up_handed_off` means open work has an accepted owner and follow-up arrangement; it does not mean that work is complete.

## Start and scope
Start after a meeting with an authoritative record and an identified chair.
Cover action extraction, owner confirmation, task publication and one follow-up cycle.
Exclude performing the underlying work and indefinite reminder automation.
The coordinator hands open work to its existing tracker or a separately authorized follow-up run.

## Ownership and resources
The meeting-operations owner maintains this process. The chair approves commitments and accepts the review.
The follow-up coordinator obtains updates; action owners accept and perform their work outside this process.

Marketplace fit: Teams whose meeting commitments need clear ownership and traceable follow-up in an existing task system.

## Before adoption
- Bind chair and follow-up coordinator roles and establish how action owners confirm commitments.
- Supply authoritative meeting, task and communication systems with stable action identifiers.
- Define notification permissions, acceptable evidence, date changes and the follow-up review cadence.
- Limit transcript and task visibility to authorized participants; confirm authorized agent write access.
- Agree service expectations and pilot normal, empty and blocked action registers.

## Exceptions and recovery
Before each external write, booking or message, recheck the current run, source request and authority. Stop and involve the owner if the request was withdrawn, the run ended or permission changed. A read-before-action check does not provide an atomic cancellation interlock; use the source system’s controls for consequential actions.
Escalate ambiguous commitments to the chair; keep unsupported actions in the draft until resolved.
Before retrying writes or messages, reconcile meetingId and action ID with target records and delivery status.
Correct existing tasks and reuse references. Do not duplicate reminders after an unknown delivery result.
A rejected review returns to review_follow_up; publication corrections require authorized edits with fresh read-back.
The coordinator escalates missing owner responses according to adopted policy and never fabricates completion.
Repeated rejection or disputed authority goes to the process owner for operator intervention.

## Measures and review
Measure accepted reviews with evidenced closure or owned continuation from action records and chair decisions.
Measure meeting-to-approved-register time and follow-up review waiting time from run and tracker timestamps.
The owner sets measurement windows and targets and reviews recurring ambiguity or overdue-owner patterns.

## Rehearsal cases
- All tasks have completion evidence: chair accepts review and the run ends actions_closed.
- Meeting has no actions: chair confirms the empty register; no task or notification is created.
- An action remains blocked: obtain an accepted continuation owner and end follow_up_handed_off.
- Task write response is lost: locate meetingId plus action ID and verify fields before retrying.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  extract_actions("Extract actions<br/>Agent"):::agent
  confirm_actions{{"Confirm actions<br/>Approval: inputs.chair"}}:::person
  publish_actions("Publish actions<br/>Agent"):::agent
  review_follow_up["Review follow up<br/>Person: follow-up-coordinator"]:::person
  accept_review{{"Accept review<br/>Approval: inputs.chair"}}:::person
  classify_result("Classify result<br/>Agent"):::agent
  closed(["Actions closed"]):::outcome
  handed_off(["Follow up handed off"]):::outcome
  extract_actions --> confirm_actions
  confirm_actions -->|"Approved"| publish_actions
  confirm_actions -.->|"Rejected"| extract_actions
  publish_actions --> review_follow_up
  review_follow_up --> accept_review
  accept_review -->|"Approved"| classify_result
  accept_review -.->|"Rejected"| review_follow_up
  classify_result -->|"The accepted review records no open actions"| closed
  classify_result -->|"The accepted review records open actions with accepted<br/>continuation owners"| handed_off
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
