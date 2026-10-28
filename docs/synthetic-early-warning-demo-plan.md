# NxHeal synthetic early-warning demo plan

**Status:** Planning document for an isolated reviewer demonstration. The personal journal remains the primary user experience. This document does not imply a central reporting service, AI model, diagnosis capability, or live data feed exists.

## Demo objective

Demonstrate how a reviewer might inspect a fictional, privacy-protective population-health signal made from aggregate symptom reports and an environmental observation, without confusing a demo with real surveillance or a diagnosis.

## Actors

- **Personal reporter:** records and manages personal health episodes privately in the journal.
- **Demo reviewer:** inspects only pre-aggregated synthetic data and its limitations.
- **Official health authority:** outside the prototype; retains responsibility for official public-health decisions and alerts.

There is no account system or real role enforcement in the current prototype. The reviewer scenario must not be presented as secured access control.

## Scenario

Use one explicitly fictional city and two clearly labelled fictional periods.

- Baseline period: 5 synthetic symptom reports and a synthetic heat observation of 33 °C.
- Current period: 10 synthetic symptom reports and a synthetic heat observation of 38 °C.
- These values are illustrative fixtures only, not epidemiological thresholds or real measurements.
- The current helper applies a transparent demonstration rule. It is not an epidemiologically validated detector and must not be described as AI.

## Reviewer view requirements

1. Persistent “DEMO ONLY — fictional data” label.
2. Comparison cards for baseline/current report counts and environmental values.
3. Source/provenance label, observation and retrieval timestamps, unit, quality status, and coarse fictional geography.
4. Clear states for missing, delayed, rejected, or incomparable observations.
5. Explainable rule outcome and why the scenario does or does not merit human review.
6. Coverage and limitations, including that reporting volume is not the same as disease incidence.
7. Explicit distinction between co-occurrence and causation.
8. Reviewer checklist and a non-binding review outcome such as “needs more information”, “no further review from this demo”, or “escalate for qualified review”. No official alerts or real-world actions.
9. No personal records, identities, exact coordinates, employee records, or free-text health notes.
10. No automatic connection to the personal journal or external APIs.

## Safety and quality cases

- Sparse current or baseline reports.
- Missing environmental observation.
- Delayed/stale environmental observation.
- Invalid provenance, timestamp, or unit.
- Environmental value that is stable or lower than baseline.
- Higher report count without corroborating evidence.
- Small group below the suppression threshold.
- Missing coverage or changes in reporting participation.
- Contradictory or incomparable data.
- Attempts to interpret the result as a diagnosis, confirmed outbreak, causal finding, or official alert.

## Acceptance criteria

- Every synthetic item is clearly labelled as fictional.
- Missing values remain unknown and are not silently changed to zero.
- Invalid or delayed environmental data cannot corroborate a current signal.
- A report increase alone does not trigger a potential-signal outcome.
- A potential signal always says that qualified human review is required.
- The view explains the rule and its limitations; it does not display a fabricated live risk score.
- The demo does not import personal journal records or call live services.
- Automated tests pass and a manual browser review confirms the intended states.
- No claim of AI diagnosis, clinical validation, prediction accuracy, or public-health benefit is made.

## Out of scope until separately designed and reviewed

- AI-assisted interpretation of clinical documents or reports.
- Diagnosis, triage, treatment recommendations, or individual risk scoring.
- Uploading real medical reports or images.
- User accounts, cloud storage, employer dashboards, central reporting, or real-time monitoring.
- Live weather/air-quality integrations.
- Official alert distribution.

These require separate requirements, clinical/safety review, privacy and security architecture, source verification, and evaluation before implementation.

## Current code foundation

The isolated `src/syntheticEarlyWarningDemo.mjs` helper creates the fictional scenario using `src/environmentalObservation.mjs` and `src/populationSignals.mjs`. Tests live in `tests/syntheticEarlyWarningDemo.test.mjs`. This is data/demo logic only; the reviewer interface is not yet implemented.
