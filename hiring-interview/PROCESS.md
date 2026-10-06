---
name: hiring-interview
description: Organize job-related interviews and record a human decision about the next recruitment stage.
inputs:
  interviewCaseId: string
  candidateRecordRef: string
  approvedRoleRef: string
  interviewPolicyRef: string
steps:
  - id: prepare_interviews
    agent: |
      Read the approved role and interview policy. Confirm the candidate record exists in the recruiting system.
      Draft job-related questions, interview assignments and a common evidence rubric for human review.
      Record scheduling and accessibility coordination needs in the restricted recruiting system.
      Do not infer protected characteristics or rank, reject or score candidates automatically.
      Escalate missing role criteria or authority to contact the candidate.
    output:
      interviewPlanRef: string
      criteriaRef: string
    evidence:
      - link
    next: approve_interviews
  - id: approve_interviews
    person: hiring-manager
    approve: |
      Inspect the role criteria, questions, rubric and panel assignments.
      Confirm questions are relevant to the approved role and permitted by the supplied policy.
      Reject unrelated criteria or missing interviewer guidance.
    on_reject: prepare_interviews
    next: conduct_interviews
  - id: conduct_interviews
    person: interview-coordinator
    task: |
      Schedule approved interviews with the candidate and panel using authorized recruiting tools.
      Search by interviewCaseId before sending invitations; read back invite details and delivery status.
      Coordinate authorized interviewers and collect their job-related observations against the approved criteria.
      Store notes in the restricted recruiting system, including missing evidence and interview completion status.
      For withdrawal or inability to complete interviews, record that status without inventing observations.
    output:
      interviewRecordRef: string
      completionStatus:
        type: string
        one_of:
          - complete
          - incomplete
          - withdrawn
    evidence:
      - link
    next: assemble_evidence
  - id: assemble_evidence
    agent: |
      Read approved criteria and the interview records, including completionStatus.
      Assemble a factual evidence index with source references and explicit gaps for human review.
      Preserve disagreements between interviewers. Do not rank candidates or recommend a hiring decision.
      If records contain inappropriate sensitive information, escalate for authorized handling before using it.
    output:
      evidenceIndexRef: string
      gaps: list
    evidence:
      - link
    next: decide_next_stage
  - id: decide_next_stage
    person: hiring-manager
    task: |
      Inspect the evidence index and original observations against approved job criteria.
      Make and record the human decision: advance, close this interview stage, or request further assessment.
      Do not advance an incomplete assessment without the policy-required human exception.
      For withdrawal, record closure at the candidate's request. Keep decision reasons in the recruiting system.
      Read back the decision record keyed by interviewCaseId; reuse it after an interrupted write.
    output:
      decisionRef: string
      rationaleRef: string
    evidence:
      - link
    next:
      - to: advance
        when: The authorized human decided to advance to the next recruitment stage
      - to: close_stage
        when: The authorized human decided not to advance or recorded candidate withdrawal
      - to: further_assessment
        when: The authorized human requested additional evidence or interviews
  - id: advance
    finish: interview_stage_advance
  - id: close_stage
    finish: interview_stage_closed
  - id: further_assessment
    finish: further_assessment_requested
---
# Hiring interview

An adaptable starter template. Configure it with recruitment practitioners and pilot before live use.

## Purpose and completion
Give the hiring manager a source-linked interview record and a recorded human next-stage decision.
The outcomes mean advance, close the interview stage, or request more assessment.
None means a person was hired, an offer was approved or a rejection notification was sent.

## Start and scope
Start with an approved role and a candidate authorized to enter the interview stage.
Cover interview planning, scheduling, observations and a human decision for one candidate.
Exclude automated candidate ranking or rejection, background checks, compensation and offer approval.
Hand further assessment to the recruiting coordinator for an authorized follow-up run with the original case reference.

## Ownership and resources
The recruitment owner maintains the procedure. The hiring manager approves criteria and owns the next-stage decision.
The coordinator schedules interviews and gathers records; panel members supply observations through the recruiting system.
Agents organize factual material and never make employment decisions.

Marketplace fit: Recruiting teams that want consistent interview evidence while keeping candidate decisions with people.

## Before adoption
- Bind hiring manager and coordinator roles and confirm panel responsibilities.
- Supply approved job criteria, interview, accessibility, retention and candidate-contact policies.
- Choose a restricted recruiting system, scheduling system and reviewer-readable evidence references.
- Limit run data to references; confirm participant access and permission for invitations and decision writes.
- Define follow-up ownership, service expectations and representative supervised pilot cases.

## Exceptions and recovery
Before each external write, booking or message, recheck the current run, source request and authority. Stop and involve the owner if the request was withdrawn, the run ended or permission changed. A read-before-action check does not provide an atomic cancellation interlock; use the source system’s controls for consequential actions.
Escalate missing criteria or inappropriate notes to the recruitment owner before assessment continues.
The manager may reject the interview plan for correction; repeated rejection requires owner intervention.
Interrupted invitations or decision writes require lookup by interviewCaseId and read-back before retrying.
Correct existing invitations rather than creating duplicates. Confirm changed schedules with affected recipients under local policy.
Missing interview evidence leads to the human further-assessment outcome unless an authorized exception supports advancement.
Candidate communications after the decision require the organization's separate approved communication procedure.

## Measures and review
Measure decisions supported by accessible job-related evidence using manager review and recruiting records.
Measure interview-stage elapsed time and time awaiting interviewer notes from run and recruiting timestamps.
The recruitment owner chooses measurement windows and targets; review pilot gaps and policy changes.

## Rehearsal cases
- Completed interviews: the human compares role criteria and records an advance decision.
- Candidate withdraws: record withdrawal and human closure without fabricated interview evidence.
- Missing interviewer notes: record gaps and request further assessment rather than inventing a score.
- Invitation response is lost: locate the existing calendar event and read back recipients before retrying.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  prepare_interviews("Prepare interviews<br/>Agent"):::agent
  approve_interviews{{"Approve interviews<br/>Approval: hiring-manager"}}:::person
  conduct_interviews["Conduct interviews<br/>Person: interview-coordinator"]:::person
  assemble_evidence("Assemble evidence<br/>Agent"):::agent
  decide_next_stage["Decide next stage<br/>Person: hiring-manager"]:::person
  advance(["Interview stage advance"]):::outcome
  close_stage(["Interview stage closed"]):::outcome
  further_assessment(["Further assessment requested"]):::outcome
  prepare_interviews --> approve_interviews
  approve_interviews -->|"Approved"| conduct_interviews
  approve_interviews -.->|"Rejected"| prepare_interviews
  conduct_interviews --> assemble_evidence
  assemble_evidence --> decide_next_stage
  decide_next_stage -->|"The authorized human decided to advance to the next recruitment<br/>stage"| advance
  decide_next_stage -->|"The authorized human decided not to advance or recorded candidate<br/>withdrawal"| close_stage
  decide_next_stage -->|"The authorized human requested additional evidence or interviews"| further_assessment
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
