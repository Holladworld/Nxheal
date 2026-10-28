# NxHeal Individual-to-Global Health Model

**Status:** Product/design proposal for review. This document describes intended behaviour; it does not mean central reporting, community analytics, or global aggregation is implemented.

## Core idea

NxHeal lets people report the symptoms and health experiences they themselves notice. With appropriate consent, purpose limits, data-quality checks, and privacy protections, those reports may become one additional signal source for authorised community, workforce, and public-health monitoring. User reports complement clinical, institutional, environmental, and official reporting; they do not replace them.

The individual is the starting point. A report is a record of a person's experience—not a diagnosis, proof of cause, or confirmation of an outbreak.

## Product layers

1. **Personal health:** a person can record symptoms, onset, severity, course/status, and optional minimal context; view and manage their own history.
2. **Relevant information:** the person can see suitable health guidance and, when supported by reliable sources and location permission, relevant environmental conditions or official advisories.
3. **Community/workforce signals:** authorised systems may analyse eligible reports in aggregate and compare them with a suitable baseline and other authorised signal types.
4. **Regional and global views:** sufficiently supported aggregate signals may be summarised at larger geographic scales. Views must show coverage, missingness, time window, source, and uncertainty.
5. **Review and action:** potential anomalies are queued for authorised human review. Official alerts remain clearly attributed to the authority that issued them.

## Geographic hierarchy

Potential levels include:

- Individual (private personal record; not a public map point)
- Small community / workplace unit
- Neighbourhood or village
- Town or city
- State, province, or region
- Country
- Continent / multi-country region
- Global overview

These levels are a conceptual hierarchy, not a promise of complete coverage or that every report can be precisely geolocated. A signal may roll up only when the underlying location is known at a suitable granularity, data is authorised for that use, minimum group-size rules are met, and quality is sufficient. If a group is too small or data is too sparse, suppress the display or aggregate to a larger area. Do not expose individual reports through map pins, filters, timestamps, or combinations of attributes.

## Proposed report data principles

Collect only what is necessary for the chosen purpose. A future submission model may include:

- A random report/episode identifier that does not expose a person's identity.
- Symptom category/categories selected by the user, with optional custom text treated as sensitive free text.
- User-reported onset and report timestamps (kept distinct).
- User-reported severity and change/status, clearly labelled as self-reported.
- Optional context such as suspected exposure/cause, explicitly not verified.
- Coarse location only when necessary and permission/consent and legal basis have been addressed.
- Optional context fields for workplace/community reporting only if justified, authorised, and designed to avoid re-identification.
- Data provenance, consent/purpose version, validation status, and retention metadata handled by the system.

This is a conceptual field list, not an approved database schema. Do not collect names, exact GPS, employer identity, identity documents, or sensitive notes by default merely to make analytics easier.

## Signal quality and interpretation

Before raising a potential signal, the system should consider:

- Reporting volume and rate, not just raw counts.
- Baseline and comparison window appropriate to seasonality and context.
- Participation/coverage changes and reporting behaviour.
- Duplicate, incomplete, delayed, conflicting, or implausible reports.
- Location uncertainty and uneven participation across groups.
- At least one additional relevant signal where available and justified (for example an authoritative environmental observation or authorised workforce incident trend).
- Clear uncertainty and limitations.

A rise in symptom reports alone does not establish an outbreak, diagnosis, causal relationship, or population risk. Correlation in time or place is not proof of causation. A potential signal means “review this pattern,” not “this event has been confirmed.”

## Roles and boundaries

- **Individual reporter:** sees and controls their own personal records and any optional sharing choices.
- **Community/workforce analyst:** sees only authorised, privacy-protected aggregates needed for a defined purpose—not personal episode histories by default.
- **Authorised reviewer:** examines a flagged signal, its evidence and limitations, and records a review outcome.
- **Public user:** may see appropriately sourced public information and official advisories, not confidential monitoring data.
- **Official authority:** remains responsible for its own formal public-health or emergency alerts.

Any cloud implementation must have authentication, server-side authorisation, tenant/data separation where relevant, retention and deletion rules, auditability, and tested access controls before real health data is accepted. Consent and other lawful/authorised bases must be determined for each deployment and jurisdiction; a checkbox alone does not solve governance.

## Challenge demonstration

Use a clearly labelled synthetic dataset until a real, authorised data pathway exists. The demonstration should show:

1. Several individual reports entered by fictional participants.
2. How reports are grouped into a small community unit without exposing individual identities.
3. A second signal class, where appropriate, with source and timestamp (synthetic if not real).
4. A baseline/comparison period and visible data coverage.
5. A possible anomaly explained in plain language, including missing data and uncertainty.
6. Small-group suppression or roll-up when the group is too small.
7. A human review decision; no automatic claim of outbreak, diagnosis, causation, or official warning.
8. A larger regional view that explicitly communicates where data is available and unavailable.

Synthetic values and locations must be visibly labelled as demo data. Never style them as live observations.

## Evaluation plan before performance claims

Define and test at least: data latency, missingness/coverage, duplicate rate, anomaly lead time, sensitivity, positive predictive value, false-alarm rate, and reviewer workload. Test sparse participation, delayed reports, contradictory signals, seasonal change, sudden changes in reporting behaviour, and cases where no alert should be raised. Do not claim predictive performance or public-health benefit until assessed against suitable ground truth and reviewed methods.

## Current implementation boundary

The current NxHeal prototype stores personal episodes in the browser's local storage. It has no user accounts, central health-reporting backend, shared database, location-aware data integration, community/workforce analytics, or global aggregation. Do not enter real personal health data in this prototype. This document is a design starting point; the model and governance need review before implementation.
