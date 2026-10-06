---
name: personal-document-renewal
description: Assemble and submit a renewal request using the issuing authority’s current instructions, then verify the issued result.
inputs:
  documentReference: string
  issuingAuthorityReference: string
  renewalDeadline: date
steps:
  - id: prepare_checklist
    agent: Read the document type and issuing authority from the references. Consult the authority’s current official renewal instructions. Record source URLs and access dates, required materials, submission channels, stated fees and appointment needs. Compare lead time with renewalDeadline without guaranteeing processing time. Escalate unclear eligibility or unavailable official instructions. Do not collect identification numbers in run data.
    output:
      checklist: string
      instructionsReference: string
      timingRisks: string
    evidence:
      - link
  - id: assemble_request
    person: initiator
    task: |-
      Review the authority’s instructions, confirm eligibility directly and assemble required documents privately. Resolve any discrepancy with the authority. Inspect prior submissions before creating a new request. Choose submit_request when the packet is complete and you want to proceed; choose deferred when not proceeding, with the deadline risk recorded.
      Require packetReference before choosing submit_request. If deferring without a complete packet, omit it and record the reason.
    output:
      packetReference:
        type: string
        optional: true
      decisionReason: string
    next:
      - to: submit_request
        when: The person confirms completeness and authorizes submission
      - to: deferred
        when: The person chooses not to submit now
  - id: submit_request
    person: initiator
    task: Use the authority’s authorized channel to submit the packet and any required fee. Verify recipient and current requirements before sending personal information. If the response is lost, inspect the authority’s status or contact it before submitting again. Record only the private receipt reference, official tracking method and next follow-up date. Complete after acceptance of the submission is confirmed, not merely attempted.
    output:
      receiptReference: string
      trackingMethod: string
      followUpDate: date
    evidence:
      - link
  - id: track_result
    person: initiator
    task: Track the request using the recorded official method and follow up on followUpDate. Respond to official requests through the authorized channel and record response references. Keep the task open while a decision is pending; do not assume silence is approval. Choose verify_document when issued, or not_renewed when the authority confirms refusal or withdrawal.
    output:
      resultReference: string
      resultSummary: string
    evidence:
      - link
    next:
      - to: verify_document
        when: The authority confirms issuance and the document is available
      - to: not_renewed
        when: The authority confirms the request was refused or withdrawn
  - id: verify_document
    person: initiator
    task: Inspect the issued document privately. Verify identity details, validity dates and the authority’s required activation or collection steps. Resolve material errors with the authority before completing. Store the document securely and record its storage reference and next review reminder without copying sensitive identifiers into this run.
    output:
      storageReference: string
      verificationSummary: string
    evidence:
      - link
    next: renewed
  - id: deferred
    finish: renewal_deferred
  - id: not_renewed
    finish: not_renewed
  - id: renewed
    finish: renewal_verified
---
# Personal document renewal

Marketplace fit: People managing a passport, permit, membership credential or other document with an issuing authority.

## Purpose and scope
The document holder owns the run. Start before the holder's chosen deadline with the document type and issuing authority known. Completion means the issued result has been received and checked. This template supplies coordination, not eligibility advice or jurisdiction-specific rules; appeals are outside scope.

## Before adoption
- Start as a person and select one document and authority per run.
- Supply current official instructions through an authoritative reference; confirm fees, eligibility and timelines there.
- Choose secure storage for personal documents, receipts and authentication credentials. Run participants must not receive full identity documents unnecessarily.
- Rehearse with fictional data. Define who follows up if the holder cannot act.

## Exceptions and recovery
The follow-up date is recorded for the person; the template does not install a reminder service or automatically poll the authority. Arrange reminders in your own system. Pending requests remain open; lost responses require reconciliation before repeat submission. A missed deadline is a risk to discuss with the authority, not permission to bypass requirements. Cancellation of a run does not withdraw an official request.

## Measures and review
Track renewal completion against the holder's deadline and requests returned for missing material. Measure elapsed time from confirmed submission to verified result. Refresh the checklist from official instructions on each use.

## Rehearsal cases
- Complete packet is accepted, issued and verified.
- Required evidence is unavailable: the person resolves it or defers.
- Submission response is lost: receipt lookup prevents a duplicate request.
- An issued document has an error: verification remains open.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  prepare_checklist("Prepare checklist<br/>Agent"):::agent
  assemble_request["Assemble request<br/>Person: initiator"]:::person
  submit_request["Submit request<br/>Person: initiator"]:::person
  track_result["Track result<br/>Person: initiator"]:::person
  verify_document["Verify document<br/>Person: initiator"]:::person
  deferred(["Renewal deferred"]):::outcome
  not_renewed(["Not renewed"]):::outcome
  renewed(["Renewal verified"]):::outcome
  prepare_checklist --> assemble_request
  assemble_request -->|"The person confirms completeness and authorizes submission"| submit_request
  assemble_request -->|"The person chooses not to submit now"| deferred
  submit_request --> track_result
  track_result -->|"The authority confirms issuance and the document is available"| verify_document
  track_result -->|"The authority confirms the request was refused or withdrawn"| not_renewed
  verify_document --> renewed
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
