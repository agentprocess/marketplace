---
name: learning-goal
description: Turn a specific learning goal into practice, demonstrated work and a reviewed next step.
inputs:
  goal: string
  baselineReference: string
  availableTimeReference: string
  successCriteriaReference: string
steps:
  - id: design_practice
    agent: Read the goal, baseline, time constraints and success criteria. Propose practice activities and an observable final demonstration appropriate to the learner. Use supplied or verifiable learning resources; distinguish estimates from commitments. Do not invent certification requirements. Escalate unclear success criteria before proposing a pass standard.
    output:
      practicePlan: string
      demonstrationBrief: string
      resourceReferences:
        type: list
        items: string
  - id: accept_plan
    person: initiator
    approve: Confirm the plan fits your available time and that the demonstration fairly measures the stated goal. Inspect resource access and any costs. Reject with specific changes if scope, resources or acceptance criteria need revision.
    on_reject: design_practice
  - id: practice
    person: initiator
    task: Complete the agreed practice and keep examples of your work. Record assistance used and difficulties encountered. Use your own work for the final demonstration and distinguish assisted from independent performance. Keep the task open if the agreed practice or demonstration is incomplete.
    output:
      workReference: string
      practiceSummary: string
      assistanceUsed: string
    evidence:
      - link
  - id: assess_work
    agent: Read the actual demonstration at workReference and compare it with each agreed criterion. Cite observable evidence and identify gaps. If the work is inaccessible, escalate rather than score unseen material. Provide formative feedback, not a credential or guaranteed proficiency claim.
    output:
      criterionFindings: string
      improvementActions: string
    evidence:
      - link
  - id: review_result
    person: initiator
    task: Review your work and the feedback against the original criteria. Choose achieved only if you can demonstrate those criteria and accept the evidence. Otherwise choose continue_learning and record the next practice goal. Do not lower the original criteria silently to declare success.
    output:
      resultReason: string
      nextAction: string
    next:
      - to: achieved
        when: The agreed demonstration meets the goal criteria
      - to: continue_learning
        when: More practice is needed or the goal must be renegotiated
  - id: continue_learning
    finish: next_practice_identified
  - id: achieved
    finish: learning_goal_demonstrated
---
# Learning goal

Marketplace fit: Self-directed learners developing a concrete skill through practice and feedback.

## Purpose and scope
The initiating learner owns a single bounded goal, such as building a small project or delivering a presentation. Success is demonstrated performance against the learner's agreed criteria. This is not professional certification or an assessment for hiring or admission.

## Before adoption
- Start as a person. Supply a baseline, realistic available time and observable criteria.
- Confirm access and permission to share work with the feedback agent. Select resources before buying anything.
- For goals requiring expert assessment, bind an appropriate reviewer in a customized copy rather than relying on model judgment.
- Rehearse with a short sample task before adopting a long learning plan.

## Exceptions and recovery
Reject an unsuitable plan before practice begins. Record interrupted or partial practice honestly. Missing evidence prevents assessment. If the demonstration falls short, this run records the next practice goal; start another run intentionally rather than inventing an unsupported task loop.

## Measures and review
Track criteria demonstrated without assistance and time from accepted plan to reviewed work. Compare estimates with actual effort and adjust the next plan without rewriting this run's success criteria.

## Rehearsal cases
- Plan rejected as too large: revise and approve a smaller plan.
- Work is inaccessible: assessment escalates and does not invent feedback.
- Criteria are met: evidence supports learning_goal_demonstrated.
- Criteria are not met: next_practice_identified records the next action.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  design_practice("Design practice<br/>Agent"):::agent
  accept_plan{{"Accept plan<br/>Approval: initiator"}}:::person
  practice["Practice<br/>Person: initiator"]:::person
  assess_work("Assess work<br/>Agent"):::agent
  review_result["Review result<br/>Person: initiator"]:::person
  continue_learning(["Next practice identified"]):::outcome
  achieved(["Learning goal demonstrated"]):::outcome
  design_practice --> accept_plan
  accept_plan -->|"Approved"| practice
  accept_plan -.->|"Rejected"| design_practice
  practice --> assess_work
  assess_work --> review_result
  review_result -->|"The agreed demonstration meets the goal criteria"| achieved
  review_result -->|"More practice is needed or the goal must be renegotiated"| continue_learning
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
