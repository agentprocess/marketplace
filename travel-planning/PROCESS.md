---
name: travel-planning
description: Prepare an approved trip itinerary and verify the chosen reservations and travel-readiness checklist.
inputs:
  tripBriefReference: string
  travelerRequirementsReference: string
  budgetReference: string
steps:
  - id: research_options
    agent: Read destination, dates, traveler needs and budget from the references. Consult current official destination and carrier information for entry and travel requirements; record sources and access dates. Compare feasible transport and lodging with total costs, change terms and accessibility requirements. Do not invent eligibility, availability or prices, and do not book. Escalate missing material facts.
    output:
      itineraryOptions: string
      requirementsChecklist: string
      sourceReferences:
        type: list
        items: string
    evidence:
      - link
  - id: select_trip
    person: initiator
    task: |-
      Choose the exact itinerary, travelers and budget allocation after reviewing current terms. Confirm relevant requirements personally with authoritative sources or a qualified adviser where needed. Choose book_trip only when you intend to book and requirements can be met; otherwise choose deferred. Record permitted alternatives and stop conditions for price changes.
      Require selectedItinerary and bookingLimits before choosing book_trip. On deferral, omit either value if no selection was made.
    output:
      selectedItinerary:
        type: string
        optional: true
      bookingLimits:
        type: string
        optional: true
      decisionReason: string
    next:
      - to: book_trip
        when: The traveler authorizes the selected bookings
      - to: deferred
        when: The traveler defers the trip
  - id: book_trip
    person: initiator
    task: Check existing reservations first. Recheck current price, dates, names, cancellation terms and availability within the selected limits. Make the authorized bookings using your own accounts. If a payment or reservation outcome is unknown, reconcile it with the provider before trying again. Record confirmed reservation references; do not mark pending bookings confirmed.
    output:
      reservationReferences:
        type: list
        items: string
      bookingSummary: string
    evidence:
      - link
  - id: verify_readiness
    person: initiator
    task: Open each provider confirmation and verify itinerary consistency, dates, time zones and traveler details. Check the requirements checklist against current official information and the actual documents privately. Resolve missing reservations or requirements before completion; do not upload passports or payment details. Save an accessible itinerary and contingency contacts.
    output:
      itineraryReference: string
      readinessSummary: string
      verifiedAt: datetime
    evidence:
      - link
    next: ready
  - id: deferred
    finish: trip_deferred
  - id: ready
    finish: trip_ready
---
# Travel planning

Marketplace fit: Individuals and families who want a coordinated trip with checked reservations and fewer last-minute surprises.

## Purpose and scope
The initiating traveler owns the plan. Start with intended dates, destination, needs and budget. Trip-ready means the chosen reservations and applicable readiness requirements have been verified; it does not guarantee entry, provider performance or a completed trip. Ongoing disruption monitoring is outside this run.

## Before adoption
- Start as a person; supply private trip and traveler references, budget and booking preferences.
- Ensure the research agent can access current official and provider information. No live prices or rules are bundled in this template.
- The person handles bookings and sensitive documents. Identify any additional traveler consent needed.
- Rehearse with fictional travelers and captured reservations before live use.

## Exceptions and recovery
Escalate unavailable authoritative requirements instead of assuming eligibility. Reprice before booking and stop when the person's limits no longer hold. The person reconciles pending charges and reservations; cancelling a run does not cancel bookings. If requirements cannot be met after booking, resolve changes/refunds with providers before closing or failing the run.

## Measures and review
Track unresolved critical readiness items and booking corrections discovered during verification. Measure time from brief to trip-ready. Review surprises after the trip before adopting the template again.

## Rehearsal cases
- A feasible itinerary is selected, booked and independently read back.
- A price changes beyond the person's limits: no unauthorized purchase.
- Booking times out after charging: inspect the reservation before retrying.
- A required document is missing: no trip_ready outcome until resolved.

## Process map

Declared transitions below. Escalation, pending work and operator cancellation follow the instructions above.

```mermaid
flowchart TD
  research_options("Research options<br/>Agent"):::agent
  select_trip["Select trip<br/>Person: initiator"]:::person
  book_trip["Book trip<br/>Person: initiator"]:::person
  verify_readiness["Verify readiness<br/>Person: initiator"]:::person
  deferred(["Trip deferred"]):::outcome
  ready(["Trip ready"]):::outcome
  research_options --> select_trip
  select_trip -->|"The traveler authorizes the selected bookings"| book_trip
  select_trip -->|"The traveler defers the trip"| deferred
  book_trip --> verify_readiness
  verify_readiness --> ready
  classDef agent fill:#E6F0EE,stroke:#0E5E59,color:#0B3B38,stroke-width:1.5px
  classDef person fill:#FDF4E4,stroke:#A15500,color:#4A2B00,stroke-width:1.5px
  classDef wait fill:#EEF3FD,stroke:#2456C2,color:#16264D,stroke-width:1.5px
  classDef flow fill:#F6F5F1,stroke:#8F8C83,color:#1C1D1A,stroke-width:1.5px
  classDef outcome fill:#1C1D1A,stroke:#1C1D1A,color:#FFFFFF
```
