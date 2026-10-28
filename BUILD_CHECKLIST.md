# NxHeal Build Checklist

> **Purpose:** This is the source of truth for the original product plan, what has actually been built, what has been tested, and what remains. Update it whenever a feature changes status. Do not mark a feature complete just because code has been written.

## Product goal

**NxHeal — Your health journey, understood.**

Build a mobile-first personal health tracking PWA for the Future Health / Hack2skill challenge. Help people record symptoms, follow a health episode over time, update recovery status, and prepare a health summary they choose to share. Community-health insights are a secondary feature and must be explainable, privacy-aware, and clearly distinguish demo data from real data.

## Product principles — keep these throughout development

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
- [ ] Run dependency installation and production build successfully.
- [ ] Check TypeScript/compiler output and fix errors.
- [ ] Verify the app loads in a browser on desktop and mobile-sized viewport.
- [ ] Add a repeatable automated test command and baseline tests.
- [ ] Add PWA manifest, icons, and service-worker/offline strategy; test installation and update behavior.
- [ ] Add clear local development and deployment instructions to README.

## 2. Symptom reporting

- [x] Add selectable symptom options.
- [x] Add symptom onset date.
- [x] Add severity selection (mild, moderate, severe).
- [x] Add optional notes and suspected-condition text, labelled as not a diagnosis.
- [x] Validate that at least one symptom is selected.
- [x] Reject missing or future onset dates.
- [x] Show a save confirmation message.
- [ ] Verify all form controls and validation in a running browser.
- [ ] Test empty form, multiple symptoms, date boundaries, long notes, and repeated submissions.
- [ ] Consider an accessible custom-symptom option if needed; do not expand scope without checking usability first.

## 3. Personal health history and episode lifecycle

- [x] Display saved episodes in a timeline/list.
- [x] Display onset date, symptoms, severity, optional suspected condition, and notes.
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

- [ ] Generate a concise summary from the user's recorded episodes.
- [ ] Distinguish recorded symptoms, suspected conditions, and user-reported diagnoses.
- [ ] Include dates and episode status without inventing clinical interpretations.
- [ ] Let the user preview and edit/review the summary before export.
- [ ] Provide a deliberate user-initiated export/share option (for example, text download or print).
- [ ] Never transmit or share health data automatically.
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

## Current session notes

### Implemented so far (not yet verified in a running app)
- Initial responsive landing interface.
- Symptom form and validation.
- Browser-local episode storage.
- Episode history, status updates, reopening, and delete confirmation.

### Verification status
- GitHub branch/file updates: confirmed by successful GitHub API responses.
- Local install/build: **not run yet**.
- Automated tests: **not run yet**.
- Browser/mobile manual checks: **not run yet**.
- Deployment: **not configured/verified yet**.

### Next actions (in order)
1. Establish a way to run CI/build checks from GitHub so we can validate without requiring the user to use a computer.
2. Fix any build/type errors found by CI.
3. Test the core journey and add automated tests for the episode data/validation behavior.
4. Update this checklist with actual results before adding the next major feature.

### Change log
- Initial checklist added after the first application and symptom-tracking implementation. Statuses intentionally separate implementation from verification.
