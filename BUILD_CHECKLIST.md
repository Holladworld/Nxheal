# NxHeal Build Checklist

> **Purpose:** This is the source of truth for the original product plan, what has actually been built, what has been tested, and what remains. Update it whenever a feature changes status. Do not mark a feature complete just because code has been written.

## Product goal

**NxHeal — Your health journey, understood.**

Build a mobile-first personal health tracking PWA for the Future Health / Hack2skill challenge. Help people record symptoms, follow a health episode over time, update recovery status, and prepare a health summary they choose to share. Community-health insights are a secondary feature and must be explainable, privacy-aware, and clearly distinguish demo data from real data.

## Product principles

- [ ] Personal health tracking comes first; community insights come after the core personal journey works.
- [ ] Clearly distinguish symptoms, suspected conditions, and user-reported diagnoses. Never imply an unverified diagnosis is medically confirmed.
- [ ] Do not claim that report counts alone prove an outbreak.
- [ ] Label all synthetic/demo data clearly. Do not invent real-world health statistics or advisories.
- [ ] Explain where personal data is stored, how it can be lost, and what the user controls.
- [ ] Do not claim anonymity, encryption, backup, or medical validation unless implemented and verified.
- [ ] User reviews and explicitly chooses what to export or share. Never share health details automatically.
- [ ] NxHeal does not diagnose or replace professional medical care. Include appropriate safety guidance.
- [ ] Keep secrets and real personal health information out of source code, fixtures, screenshots, and Git history.

## Status legend

- [ ] **Not started**
- [x] **Implemented** only means code exists; it does not mean tested.
- For each feature, record implementation and verification separately.
- **Verified** means the relevant build/test/manual acceptance checks actually passed.

## 1. Foundation and project setup

- [x] Create GitHub repository and initial README.
- [x] Create isolated development branch: `feat/mvp-foundation`.
- [x] Add initial React + TypeScript + Vite project configuration.
- [x] Add initial responsive landing/dashboard interface.
- [x] Run dependency installation and production build successfully through GitHub Actions CI (Node 20; `npm install`; `npm run build`).
- [x] Check TypeScript/compiler output and fix the `FormEvent` type-only import error.
- [ ] Verify the app loads in a browser on desktop and mobile-sized viewport.
- [x] Add a repeatable automated test command (`npm test`).
- [x] Add baseline automated tests for symptom/date validation; broader lifecycle and summary tests remain outstanding.
- [ ] Add PWA manifest, icons, and service-worker/offline strategy; test installation and update behavior.
- [ ] Add clear local development and deployment instructions to README.

## 2. Symptom reporting

- [x] Add selectable symptom options, including dizziness, chest pain, shortness of breath, abdominal pain, injury, and skin changes.
- [x] Add a custom symptom description when “Other” is selected.
- [x] Show urgent-care guidance when chest pain or shortness of breath is selected (guidance still requires safety review).
- [x] Add symptom onset date.
- [x] Add severity selection (mild, moderate, severe).
- [x] Add optional notes and suspected-condition text, labelled as not a diagnosis.
- [x] Add a separate optional user-reported condition field, explicitly labelled as not independently verified.
- [x] Validate that at least one symptom is selected.
- [x] Reject missing or future onset dates.
- [x] Show a save confirmation message.
- [ ] Verify all form controls and validation in a running browser.
- [x] Add automated checks for empty symptom selection, required custom symptom, missing/future dates, and valid current/past dates.
- [ ] Manually test multiple symptoms, date boundaries, long notes, and repeated submissions in a running browser.
- [ ] Consider an accessible custom-symptom option if needed; do not expand scope without checking usability first.

## 3. Personal health history and episode lifecycle

- [x] Display saved episodes in a timeline/list.
- [x] Display onset date, symptoms, severity, optional suspected condition, user-reported condition, and notes.
- [x] Add ongoing, improving, and recovered statuses.
- [x] Allow status changes and reopening a recovered/improving episode.
- [x] Add a delete action with confirmation.
- [x] Add browser-local persistence using localStorage.
- [ ] Verify save → refresh → entry remains.
- [ ] Verify status updates edit the same episode and do not create duplicate episodes.
- [ ] Verify delete removes only the selected episode.
- [ ] Verify storage exceptions and malformed stored data are handled safely.
- [ ] Decide and document whether the prototype needs edit-symptoms/notes capability after initial save.
- [ ] Make the local-only nature and browser-data-loss limitation visible and understandable.
- [ ] Review whether sensitive notes should be encouraged in this prototype; default to data minimisation.

## 4. Health summary and user-controlled sharing

- [x] Implement generation of a concise summary from the user's recorded episodes (verification still outstanding).
- [x] Distinguish recorded symptoms, suspected conditions, and user-reported conditions in the generated text (verification still outstanding).
- [x] Include episode start dates, user-reported severity, status, user-entered notes, and last-updated dates without adding clinical interpretations (verification still outstanding).
- [x] Let the user preview and edit/review the summary before export (verification still outstanding).
- [x] Add user-initiated text download and print / Save as PDF options (verification still outstanding).
- [x] Keep export user-initiated; no automatic transmission or sharing is implemented (verify behavior in browser).
- [ ] Test empty history, long history, special characters, and privacy of exported content.

## 5. Community-health insights (after personal tracking works)

- [ ] Define the precise demo use case and the intended user/decision-maker.
- [ ] Use clearly labelled synthetic data unless a suitable authoritative source and its terms are verified.
- [ ] If demonstrating anomaly detection, combine at least two materially different signal types where appropriate; document source, time range, missingness, and limitations.
- [ ] Explain the signal and uncertainty in plain language; avoid black-box risk labels.
- [ ] Do not infer an outbreak from an increase in app reports alone.
- [ ] Do not show fabricated “live” risk percentages, real-looking alerts, or unsupported geographic hotspots.
- [ ] Show how privacy is protected in aggregation; suppress small groups and avoid exposing identifiable individual reports.
- [ ] Define evaluation measures before claiming usefulness (e.g. lead time, sensitivity, positive predictive value, false alarms, data latency, and missing data).
- [ ] Label the screen and all fixtures as demo/synthetic when they are not real.
- [ ] Test empty, sparse, delayed, and contradictory data cases.
- [ ] Document what the prototype cannot conclude and what human review/action would be needed.

## 6. Privacy, security, accessibility, and safety review

- [ ] Review every field for necessity; avoid precise GPS and identity documents unless there is a compelling, reviewed requirement.
- [ ] Explain local storage and its limitations. Do not imply device-local data is a secure medical record.
- [ ] If cloud storage/authentication is added, implement and test server-side access control and row-level security before entering real health data.
- [ ] Do not commit secrets, tokens, production credentials, or real health records.
- [ ] Check keyboard navigation, visible focus, form labels, error announcements, contrast, and reduced-motion behavior.
- [ ] Check mobile layout, readable text, touch target size, and zoom.
- [ ] Check safety/disclaimer wording and avoid diagnosis/treatment recommendations.
- [ ] Verify any third-party fonts/services and decide how the app behaves without a network connection.

## 7. Quality and submission readiness

- [ ] Production build passes.
- [ ] Automated tests pass and their actual output is recorded.
- [ ] Manual smoke test passes on a mobile viewport.
- [ ] Test the complete user journey: record → view history → refresh → update → recover → summary/export.
- [ ] Check browser console for errors and failed requests.
- [ ] Confirm the app's deployed version matches the reviewed commit.
- [ ] README explains purpose, setup, features, limitations, data handling, and demo instructions.
- [ ] Prepare screenshots or a short demo walkthrough using only synthetic/test data.
- [ ] Check the official challenge portal for current submission requirements and deadline.
- [ ] Final product and privacy review completed.


## 8. Challenge 06 scope: population and workforce health early warning

This is a required product direction, not a promise that the capability already exists. The current prototype is still a personal symptom-tracking foundation.

### Broad health-event model
- [ ] Support general symptoms and discomfort, not a single illness: examples include headache, fatigue, dizziness, pain, breathing difficulty, fever, nausea, and injury.
- [ ] Allow a person to record a suspected cause separately from a user-reported diagnosis/condition; do not present either as independently verified.
- [ ] Include environmental exposure observations such as heat, humidity, and air quality, with source, timestamp, location granularity, and data-quality notes where applicable.
- [ ] Include workforce-health signals such as aggregate sickness absence, first-aid visits, workplace incidents, and injury reports only where collection and use are appropriately authorised.
- [ ] Model cancer and other serious conditions only as user-reported conditions/diagnoses when entered by the user or a suitably authorised source; do not infer them from symptoms.
- [ ] Treat chest pain and other potentially urgent symptoms carefully. Provide appropriate urgent-care guidance for warning signs; never reassure users that a serious symptom is harmless.

### Privacy and organisational boundaries
- [ ] Keep an individual's personal episode details private by default; never make them visible to an employer merely because aggregated workforce insights are available.
- [ ] Define role-based access and data separation before introducing organisational accounts or cloud storage.
- [ ] Use minimum necessary, appropriately aggregated workforce data; suppress small groups and avoid re-identification through combinations of filters.
- [ ] Document the purpose, lawful/authorised basis, retention, access, and secondary use for any workplace or environmental data source.
- [ ] Avoid precise GPS and employee identity in the early-warning demonstration unless specifically justified and reviewed.

### Explainable early-warning demonstration
- [ ] Build a clearly labelled synthetic-data scenario combining at least two signal classes, preferably environmental conditions plus health reports and/or workplace incidents.
- [ ] Example scenario: high heat/humidity alongside a change in reports of dizziness/headache/fatigue and a rise in first-aid visits or heat-related incidents.
- [ ] Show which signals changed, comparison period/baseline, data coverage, missing data, uncertainty, and why the pattern merits human review.
- [ ] Present outputs as a potential concern for review, not a confirmed outbreak, diagnosis, causal finding, or definitive risk score.
- [ ] Include a human-review/response step and clearly state what action the prototype can and cannot recommend.
- [ ] Test sparse data, delayed data, conflicting signals, seasonal changes, reporting-behaviour changes, and false alarms.
- [ ] Define evaluation criteria before making performance claims: lead time, sensitivity, positive predictive value, false-alarm rate, missingness, and latency.
- [ ] Do not claim a public-health benefit or predictive accuracy until evaluated against suitable evidence.

### Current implementation boundary
- [x] Record this scope explicitly in the development checklist.
- [ ] Broad symptoms and serious-condition handling implemented and verified.
- [ ] Environmental/workforce signal data model implemented and tested.
- [ ] Explainable early-warning logic implemented and tested using labelled synthetic data.
- [ ] Privacy/access boundaries for organisational insights designed and tested.
- [ ] End-to-end early-warning scenario demonstrated and reviewed.


## Current session notes

### Implemented so far (browser behavior still needs manual verification)
- Initial responsive landing interface.
- Symptom form with broader symptom choices and a custom description for “Other”.
- Separate suspected-condition and user-reported-condition fields, with the latter labelled as not independently verified.
- Conditional urgent-care guidance for chest pain or shortness of breath.
- Symptom/date/severity/notes/suspected-condition validation.
- Browser-local episode storage.
- Episode history, status updates, reopening, and delete confirmation.
- Explicit workforce and environmental early-warning scope.

### Verification status
- GitHub branch/file updates: confirmed by successful GitHub API responses.
- GitHub Actions dependency install + TypeScript checks + production build: **passed** on the feature and styling commits.
- Automated behavior tests: **not added/run yet**.
- Browser/mobile manual checks: **not run yet**.
- Accessibility and medical safety wording review: **not complete**.
- Deployment: **not configured/verified yet**.

### Next actions (in order)
1. Add automated tests for episode lifecycle and health-summary generation.
2. Verify the core form and timeline behavior on a running mobile-sized browser.
3. Verify health-summary empty/multiple episode, special-character, notes, download, and print cases.
4. Design the environmental/workforce signal model and then the synthetic early-warning demonstration.

### Change log
- Initial checklist added after the first application and symptom-tracking implementation. Statuses intentionally separate implementation from verification.
