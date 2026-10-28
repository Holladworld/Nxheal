# NxHeal Environmental and Workforce Signal Model

**Status:** Design proposal only. No environmental API, workplace feed, cloud reporting, or live signal dashboard is connected to the application.

## Purpose

Define a cautious, source-aware way to represent environmental observations and authorised aggregate workforce-health indicators that could later be compared with appropriately aggregated, consent-aware health reports. This model must not change the personal health journal into a workplace monitoring tool.

## Design rules

- Keep personal episodes and monitoring observations in separate data domains.
- Never send local journal entries to a monitoring service automatically.
- Do not infer that an environmental condition caused a symptom merely because they occurred together.
- Treat user-entered symptoms, environmental measurements, workplace incidents, and official advisories as different signal classes with distinct provenance.
- Use synthetic fixtures for development until a real source, its terms, coverage, update frequency, and permitted use are verified.
- Do not collect employee names, personal identifiers, precise GPS, or individual sickness records for an aggregate workforce signal.
- If the number of people represented is too small, suppress the result or roll up to a broader unit. Suppression must also account for repeated filters that could reveal a suppressed group.
- Preserve unknown and missing values as unknown; never silently substitute zero.
- A potential signal means “needs human review,” not a diagnosis, confirmed outbreak, causal finding, or official warning.

## Proposed observation record

A future environmental observation should contain the following fields where available:

| Field | Meaning |
| --- | --- |
| `observationId` | Random internal identifier, not a person identifier |
| `signalType` | Controlled category such as heat, humidity, air quality, or official advisory |
| `value` / `unit` | Numeric observation and explicit unit, when applicable |
| `observedAt` | Time the measurement describes, distinct from retrieval time |
| `retrievedAt` | Time NxHeal obtained the observation |
| `sourceName` / `sourceUrl` | Provenance of the observation |
| `sourceRecordId` | Optional provider identifier, if permitted |
| `geographyLevel` / `geographyCode` | Coarse area code and level, not a person's location |
| `qualityStatus` | For example: valid, estimated, delayed, missing, or rejected |
| `qualityNotes` | Short explanation of known limitations |
| `isSynthetic` | Explicit flag for demo/test data |

Provider-specific fields should be mapped through an adapter rather than copied indiscriminately into the core model. Units, time zones, coordinate precision, missing-value conventions, and source attribution must be normalised and tested.

## Proposed aggregate workforce indicator

Workforce information should enter only as a pre-aggregated, authorised count or rate for a defined unit and time window. Possible categories include workplace first-aid visits, incident counts, or aggregate sickness absence, only where the data owner has approved the purpose and the collection is lawful.

A future record may include:

- A random aggregate-record identifier.
- A coarse workplace/community unit code and geography level.
- A defined indicator category and numerator.
- A denominator or eligible population only when legitimately available and needed to interpret a rate.
- A start/end time window and the time the record was received.
- Source/owner, authorisation and purpose metadata, quality status, and retention rule.
- A suppression status and minimum-group rule.

Do not treat an absent workforce feed as zero incidents. Do not compare counts across units without considering population size, reporting coverage, and changes in reporting practices.

## Joining signal classes safely

A later analysis layer may compare:
1. Aggregated symptom reports over a stated period.
2. A suitable baseline and comparison window.
3. One or more relevant environmental observations or authorised aggregate workforce indicators.
4. Data coverage, missingness, reporting changes, and source freshness.

The result should explain which signals changed, the comparison period, the available coverage, and the limitations. Correlation is not causation. A rise in symptom reports alone must not trigger a claim of an outbreak. Any potential signal must be routed to an authorised human reviewer before an official response or alert.

## Source integration gate

Before integrating any provider:
1. Confirm the official source and current API/documentation.
2. Review licence, attribution, rate limits, authentication, and allowed use.
3. Confirm geographic coverage, resolution, timestamps, units, and expected update delay.
4. Define outage, stale-data, partial-coverage, and invalid-value behavior.
5. Keep credentials out of source code and public client bundles.
6. Add adapter tests using synthetic fixtures, including missing and contradictory values.
7. Document the source version and retrieval time in demo/reviewer views.

Initial candidate sources are documented separately in `environmental-signal-options.md`; they have not yet been verified for production use or integrated into NxHeal.

## Current implementation boundary

The existing app continues to store personal episodes in browser `localStorage`. This document does not add a data feed, location collection, employer access, central reporting, or live monitoring. The existing population-signal helper remains isolated from the journal UI. The next implementation step should be a small, typed, testable normalisation layer using synthetic fixtures—not a live API connection or a new panel inside the personal journal.
