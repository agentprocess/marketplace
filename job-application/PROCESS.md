---
name: job-application
description: Prepare, review and submit one truthful job application, then record receipt and follow-up.
inputs:
  jobPostingReference: string
  experienceReference: string
  applicationPreferencesReference: string
steps:
  - id: review_opportunity
    agent: Read the actual job posting, the applicant’s experience and preferences. Verify the application channel and whether the posting remains open. Compare stated job requirements with documented experience; distinguish gaps from facts. Do not invent experience, credentials or personal characteristics. Prepare a tailored application draft and list questions requiring the applicant’s decision.
    output:
      applicationDraft: string
      fitAndGaps: string
      openQuestions:
        type: list
        items: string
      submissionInstructions: string
  - id: choose_application
    person: initiator
    task: Read the draft, posting and gaps. Correct factual claims and decide whether to apply. Confirm the recipient, privacy choices and any required disclosures yourself. Choose finalize when you intend to proceed; otherwise choose declined. Do not provide unnecessary sensitive information in the run. Require approvedContentReference before choosing finalize; omit it if declining without approving content.
    output:
      approvedContentReference:
        type: string
        optional: true
      decisionReason: string
    next:
      - to: finalize
        when: The applicant chooses to prepare the application for submission
      - to: declined
        when: The applicant chooses not to apply
  - id: finalize
    agent: Use only the applicant-approved content to prepare the required documents and responses. Verify names, dates, links, required formats and consistency with the posting. Mark any remaining factual question instead of guessing. Store final files at an accessible approved location; do not submit or contact the employer.
    output:
      finalPacketReference: string
      qualityCheckSummary: string
    evidence:
      - link
  - id: approve_packet
    person: initiator
    approve: Open the actual packet and confirm it is truthful, complete, correctly addressed and ready to submit. Inspect required answers and consent choices. Reject to finalize with corrections when anything is wrong; do not approve an unseen packet.
    on_reject: finalize
  - id: submit_application
    person: initiator
    task: Confirm the role is still open and inspect prior applications for this same posting before submitting. Use the verified employer channel and the approved packet. Reconcile an uncertain response before submitting twice. Record the receipt or confirmation and an appropriate follow-up plan consistent with the employer’s instructions. Keep the task open without a confirmed submission result.
    output:
      submissionReference: string
      submittedAt: datetime
      followUpPlan: string
    evidence:
      - link
    next: submitted
  - id: declined
    finish: application_declined
  - id: submitted
    finish: application_submitted
---
# Job application

Marketplace fit: Job seekers who want tailored, truthful applications with a final personal review.

## Purpose and scope
The initiating applicant owns one application to one posting. Completion means submission is confirmed and follow-up is recorded; it does not imply an interview or offer. Employer selection decisions and automated candidate ranking are outside scope.

## Before adoption
- Start as a person and supply the real posting, documented experience and preferences.
- Choose secure document storage and decide what personal information may be shared with the agent.
- Confirm the employer's legitimate submission channel and required formats; no email or portal permission is implied by this template.
- Rehearse using a fictional posting and applicant. No applications or messages should be sent during a test run.

## Exceptions and recovery
A closed posting or suspect channel prevents submission. The applicant resolves factual questions; the agent cannot fill experience gaps with invented claims. After a lost submission response, inspect application history or contact the employer through a verified channel before trying again. A recorded follow-up plan is not an automatically scheduled message.

## Measures and review
Track submitted applications with verified receipt and corrections found at final review. Measure time from posting review to confirmed submission. Review process friction independently from employer outcomes.

## Rehearsal cases
- Applicant decides not to apply: application_declined before submission.
- A draft overstates experience: applicant corrects it before approval.
- Packet is rejected: revised files return for a fresh review.
- A portal times out after accepting: recover the existing confirmation without duplicate submission.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  review_opportunity("Review opportunity<br/>Agent"):::agent
  choose_application["Choose application<br/>Person: initiator"]:::person
  finalize("Finalize<br/>Agent"):::agent
  approve_packet{{"Approve packet<br/>Approval: initiator"}}:::person
  submit_application["Submit application<br/>Person: initiator"]:::person
  declined(["Application declined"]):::outcome
  submitted(["Application submitted"]):::outcome
  review_opportunity --> choose_application
  choose_application -->|"The applicant chooses to prepare the application for submission"| finalize
  choose_application -->|"The applicant chooses not to apply"| declined
  finalize --> approve_packet
  approve_packet -->|"Approved"| submit_application
  approve_packet -.->|"Rejected"| finalize
  submit_application --> submitted
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
