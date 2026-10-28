# NxHeal Build Checklist

> **Purpose:** This is the source of truth for the original product plan, what has actually been built, what has been tested, and what remains. Update it whenever a feature changes status. Do not mark a feature complete just because code has been written.

## Product goal

**NxHeal — Your health journey, understood.**

Build NxHeal as a global, user-centred health reporting and early-warning platform for the Future Health / Hack2skill challenge. People are active contributors: they record symptoms and health experiences themselves, access relevant health information, and—only through a deliberately designed, consent-aware and privacy-protective reporting system—contribute to population-level signals. Help individuals track their own health while enabling authorised health organisations to explore explainable, appropriately aggregated patterns from small communities upward (for example, neighbourhood/village → town → city → state/region → country → continent → world). Combine user-reported signals with suitable external health, environmental, and event information where reliable and relevant. Community and workforce health are core parts of the intended product, not afterthoughts. The current prototype does not yet send personal reports to a central system.

## Product principles

- [ ] Build in stages: first make personal reporting dependable, then implement the community/workforce reporting and privacy-protected aggregation that connects individual experiences to wider population-health monitoring.
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
- [x] Add automated tests for symptom/date validation and episode lifecycle helper behavior, including in-place episode detail edits that preserve identity/status/creation time.
- [x] Add automated tests for health-summary generation, including empty history, condition-label separation, special characters, multiple episodes, and incomplete legacy fields.
- [x] Add PWA manifest, scalable SVG app icon, production service-worker registration, and initial app-shell/static-asset caching strategy.
- [ ] Verify PWA installation, icon compatibility, offline behavior, cache refresh, and service-worker update behavior on a real browser.
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
- [ ] Verify save → refresh → entry remains (user has confirmed saving works; persistence after refresh still needs a deliberate check).
- [ ] Verify status updates edit the same episode and do not create duplicate episodes.
- [ ] Verify delete removes only the selected episode.
- [x] Add defensive loading for storage exceptions, malformed JSON, non-array data, and malformed episode entries; automated tests added.
- [x] Add helper-level persistence round-trip tests covering save/reload, status update without duplicate creation, and deleting one selected entry; these do not replace browser acceptance testing.
- [ ] Verify storage recovery behavior in a running browser.
- [x] Add an edit-details workflow for saved episodes; it updates the existing ID in place, preserves status and creation time, and supports cancel. Automated helper tests cover in-place updates and unknown IDs; browser verification remains outstanding.
- [ ] Make the local-only nature and browser-data-loss limitation visible and understandable.
- [ ] Review whether sensitive notes should be encouraged in this prototype; default to data minimisation.

## 4. Health summary and user-controlled sharing

- [x] Implement generation of a concise summary from the user's recorded episodes (verification still outstanding).
- [x] Distinguish recorded symptoms, suspected conditions, and user-reported conditions in the generated text (verification still outstanding).
- [x] Include episode start dates, user-reported severity, status, user-entered notes, and last-updated dates without adding clinical interpretations (verification still outstanding).
- [x] Let the user preview and edit/review the summary before export (verification still outstanding).
- [x] Add user-initiated text download and print / Save as PDF options (verification still outstanding).
- [x] Keep export user-initiated; no automatic transmission or sharing is implemented (verify behavior in browser).
- [x] Add unit tests for empty history, multiple episodes, special characters, condition-label separation, and incomplete legacy fields.
- [ ] Verify summary content, long history, download, print/PDF, and privacy of exported content in a running browser. User has manually confirmed that saving and printing work; broader summary/export checks remain outstanding.

## 5. Community, workforce, and global population-health monitoring

- [ ] Define the precise demo use case and intended users/decision-makers, including individual reporters and authorised community, workforce, and public-health reviewers.
- [ ] Define a user-contributed reporting pathway: what people submit, what is optional, how consent and purpose are explained, how reports are validated/deduplicated, and what may be used for aggregated monitoring.
- [ ] Design a geographic hierarchy from the smallest useful unit upward (e.g. neighbourhood/village → town → city → state/region → country → continent → world); define how reports roll up, how missing/uneven coverage is shown, and when a unit has too little data to display.
- [ ] Keep personal episode details separate from aggregate monitoring views. Never expose individual records to community reviewers, employers, or authorities by default.
- [ ] Define how global monitoring combines user-submitted signals with relevant authoritative external sources without treating either as automatically complete or definitive.
- [x] Record initial environmental API candidates and integration caveats in `docs/environmental-signal-options.md` (source assessment only; no API integrated).
- [x] Draft `docs/environmental-workforce-signal-model.md` defining proposed source-aware environmental observations, pre-aggregated workforce indicators, data-quality fields, privacy boundaries, and source-integration gates; design only, no live feed or workforce data implemented.
- [ ] Use clearly labelled synthetic data unless a suitable authoritative source and its terms are verified.
- [ ] If demonstrating anomaly detection, combine at least two materially different signal types where appropriate; document source, time range, missingness, and limitations.
- [x] Add an isolated, transparent rule-based signal-evaluation helper with explicit insufficient-data, report-increase-only, and potential-signal-for-review outcomes; this is demo logic only, not a validated detector and not yet connected to the UI.
- [x] Add aggregate-count and small-group suppression helpers; automated tests are added, with CI verification pending.
- [x] Keep population-signal evaluation isolated from the personal journal interface; the synthetic community panel was removed from the user-facing journal to preserve a calm, personal-journal experience. The helper remains for later authorised/aggregated monitoring design.
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


### Workforce aggregate indicator model — Step 1
- [x] Add `src/workforceIndicator.mjs` to validate pre-aggregated sickness-absence, first-aid, workplace-incident, and injury-report indicators.
- [x] Require reporting period, coarse geography, source, explicit synthetic flag, authorisation status, quality status, and explicit count/rate semantics.
- [x] Reject person-level identifiers and individual-record payloads; this helper accepts aggregate indicators only.
- [x] Preserve missing values as null; reject invalid periods, negative values, fractional counts, and ambiguous rates.
- [x] Add reviewer-safe presentation rules that withhold pending/unauthorised, missing/delayed/rejected, and small-group indicators.
- [x] Add TypeScript declarations and automated tests in `tests/workforceIndicator.test.mjs`.
- [ ] Verify production build and all automated tests in GitHub Actions.
- [ ] Review the minimum group-size policy and complementary suppression requirements before any real deployment; the default of five is a prototype safeguard, not a guarantee against re-identification.
- [ ] Keep this model disconnected from personal journal records and real workplace systems until governance and source authorisation are established.

## 8. Challenge 06 scope: population and workforce health early warning

This is a required product direction, not a promise that the capability already exists. The current prototype is still a personal symptom-tracking foundation.

### Broad health-event model
- [ ] Support general symptoms and discomfort, not a single illness: examples include headache, fatigue, dizziness, pain, breathing difficulty, fever, nausea, and injury.
- [ ] Allow a person to record a suspected cause separately from a user-reported diagnosis/condition; do not present either as independently verified.
- [x] Add an isolated environmental-observation normalizer with explicit source, observed/retrieved timestamps, units, coarse geography, quality status, and synthetic-data flag; automated tests cover valid, missing, and invalid observations. This is a schema helper only, not a live feed.
- [ ] Integrate verified environmental exposure observations such as heat, humidity, and air quality from an authorised source, with source coverage and update latency documented.
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
- [x] Build an isolated, clearly labelled synthetic-data scenario combining environmental heat observations and symptom-report counts; it does not read personal journal entries or call external services. Automated tests cover elevated, missing, delayed, and invalid environmental observations. CI verification pending.
- [x] Define the isolated synthetic early-warning scenario, actors, scope, acceptance criteria, and safety/failure cases in `docs/synthetic-early-warning-demo-plan.md`.
- [x] Build a separate reviewer/demo interface at `?view=reviewer-demo`; it is isolated from the personal journal UI and uses only fictional scenario data. Build and automated tests passed in GitHub Actions run 40690059817.
- [x] Represent changed signals, a fictional comparison baseline, data quality/missingness, and human-review guidance in the isolated synthetic demo helper. The separate reviewer interface presents these values with quality labels and review guidance.
- [x] Present outputs as a potential concern for review only, with explicit non-diagnosis, non-causation, non-outbreak and non-alert boundaries in the reviewer demo.
- [x] Include a local-only training review outcome selector and reviewer checklist; it does not transmit, persist, or issue alerts. Real-world action remains out of scope.
- [ ] Test sparse data, delayed data, conflicting signals, seasonal changes, reporting-behaviour changes, and false alarms.
- [ ] Define evaluation criteria before making performance claims: lead time, sensitivity, positive predictive value, false-alarm rate, missingness, and latency.
- [ ] Do not claim a public-health benefit or predictive accuracy until evaluated against suitable evidence.

### Current implementation boundary
- [x] Record this scope explicitly in the development checklist.
- [ ] Broad symptoms and serious-condition handling implemented and verified.
- [ ] Environmental/workforce signal data model implemented and tested.
- [x] Initial explainable rule-based early-warning helper implemented and tested; its synthetic population-health panel is not shown in the personal journal UI. This is not validated epidemiological logic.
- [ ] Privacy/access boundaries for organisational insights designed and tested.
- [ ] End-to-end early-warning scenario demonstrated and reviewed.
- [ ] Community-to-global aggregation model demonstrated with clearly labelled synthetic data, including sparse-data and small-group suppression behaviour.


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
- Product direction clarified: user-submitted health experiences are intended to complement institutional/external reporting, with community/workforce signals rolling up into wider geographic views under privacy and data-quality controls. This is a product requirement, not an implemented capability.
- Initial competitor/gap desk review recorded in `docs/early-warning-landscape.md`; it identifies a hypothesis, not a proven unique market gap.
- Product direction documented in `docs/individual-to-global-health-model.md`: people-submitted health experiences can complement institutional reporting and, under strict governance, contribute to privacy-protected community/workforce and wider geographic signals. This is design documentation only; central reporting and aggregation are not implemented.
- Initial environmental-source assessment recorded in `docs/environmental-signal-options.md`; NiMet, Open-Meteo, and AirQo are candidates only and have not been integrated or validated in-app.
- Added helper-level persistence round-trip tests for save/reload, update-without-duplicate, and delete-one behavior; CI passed in run 40680490005.
- Added saved-episode detail editing on `feat/mvp-foundation`: edit symptoms, onset date, severity, notes, suspected condition, and user-reported condition; save updates the same record and preserves its ID, status, and original creation time. Added helper tests for in-place edits and unknown IDs. CI passed for the implementation in runs 40685441311 and 40685509656. Added a persistence round-trip regression test confirming an edited episode survives reload without duplication and preserves ID, status, and creation time; TypeScript/build and automated tests passed in run 40686622576. Browser acceptance remains outstanding.
- Added `docs/environmental-workforce-signal-model.md` as a design-only next-stage specification. It defines provenance, timestamps, coarse geography, quality/missingness, authorised pre-aggregated workforce indicators, privacy suppression, and the source-integration gate. No live API, cloud reporting, or journal UI was added.
- Added an isolated `src/environmentalObservation.mjs` normalizer and TypeScript declarations. Automated tests cover valid provenance, time-zone normalization, explicitly missing values (never coerced to zero), unsupported types, invalid timestamps/URLs, missing units, and synthetic-data labelling. This does not connect to the personal journal or any live source; CI verification is pending.
- Added `src/syntheticEarlyWarningDemo.mjs`, an isolated fictional heat-plus-symptom scenario that uses the environmental observation normalizer and existing transparent signal helper. Tests cover human-review-only output, missing/delayed data, and invalid observations. It is not connected to the journal UI, personal records, or live services; CI verification is pending.
- Added `docs/synthetic-early-warning-demo-plan.md` to define the separate reviewer demo's actors, fictional scenario, acceptance criteria, safety/failure cases, and out-of-scope AI/clinical features. A separate synthetic reviewer interface is now implemented; no AI feature has been implemented.
- Added isolated population-signal demo logic, aggregate-count helper, and small-group suppression helper with tests. CI passed in run 40682851979.
- Removed the user-facing synthetic Community Signals panel from `src/App.tsx` after product-direction clarification: NxHeal should feel like a personal health journal, while population-level use belongs in the governed data/aggregation layer—not a repeated in-your-face UI panel. The population-signal helper and tests remain isolated for future design.
- Initial PWA foundation: manifest, scalable SVG app icon, production-only service-worker registration, navigation fallback, and same-origin static asset caching. This is implemented but not yet browser-tested.

### Verification status
- GitHub branch/file updates: confirmed by successful GitHub API responses.
- Separate reviewer demo: TypeScript production build and automated tests passed in GitHub Actions run 40690059817. Earlier intermediate commits failed because the JavaScript demo module lacked a TypeScript declaration; the declaration was added and the latest run passed.
- Production build and automated tests for validation, episode lifecycle, health summaries, and defensive episode storage: passed in GitHub Actions, including [the latest navigation accessibility check](https://github.com/Holladworld/Nxheal/actions/runs/40679832936).
- Mobile bottom-navigation active-state and Record scrolling changes: automated CI passed in [run 40679619698](https://github.com/Holladworld/Nxheal/actions/runs/40679619698) and the subsequent accessibility change passed in [run 40679832936].
- User manually confirmed that saving a health entry and printing a summary work. This is useful initial feedback, but it does not replace a full save-refresh-update-delete/export acceptance test.

- Browser/mobile manual checks: **not run yet**.
- Accessibility and medical safety wording review: **not complete**.
- Deployment: **not configured/verified yet**.

### Next actions (in order)
1. Complete browser acceptance: save → refresh → edit symptoms/notes → save changes → confirm one record with the same identity → update status → delete one selected entry.
2. Keep the journal experience personal and simple. Develop any population-health demonstration as a separate reviewer/demo view or presentation layer, not as a prominent feature inside the user's personal journal. Use synthetic data until an authorised reporting pathway is established.
3. Review `docs/individual-to-global-health-model.md` and turn its proposed data/role/privacy model into a scoped synthetic-data demo plan before changing application code.
4. Choose a demonstration geography only as a test case—not as NxHeal's product boundary—and verify any external data source, access, terms, timestamps, and coverage before integration.
5. Verify health-summary empty/multiple episode, special-character, notes, download, and print/PDF cases on mobile.
6. Review PWA icon compatibility and service-worker cache/update behavior before calling the PWA verified.
7. Run a privacy, accessibility, and medical-safety wording review.
8. Smoke-test the separate reviewer demo at `?view=reviewer-demo`, then continue failure-case tests and refine the reporting/aggregation model.
9. Verify install/offline/cache-update behavior and document any browser limitations.

### Change log
- Initial checklist added after the first application and symptom-tracking implementation. Statuses intentionally separate implementation from verification.


- Added `src/ReviewerDemo.tsx` as a separate query-selected reviewer view (`?view=reviewer-demo`) with fictional report counts, fictional environmental baseline/current values, provenance and quality labels, limitations, reviewer checklist, and a session-only training outcome selector. It does not read journal data, call live services, send data, or issue alerts. CSS is scoped to reviewer classes. TypeScript production build and automated tests passed in GitHub Actions run 40690059817.


### Stage 1 — NxHeal Live Map (2026-10-28)
- [x] Add an isolated route at `?view=live-map-demo`; the personal journal remains the default route and `?view=reviewer-demo` remains available.
- [x] Add an interactive world map using Leaflet with CARTO light basemap tiles and OpenStreetMap/CARTO attribution; the volunteer-run OSM standard tile endpoint was removed after returning a policy 403.
- [x] Add selectable Environment, Public health, and Community signals layers; status and time-window filters; reset controls; marker selection; event detail cards; and an event list.
- [x] Label every event as fictional/synthetic and explicitly state that no live feeds, real incidents, personal journal records, or official alerts are represented.
- [ ] Verify the new route in a running Codespaces browser, including map loading, marker selection, filters, reset, mobile layout, and browser console.
- [ ] Verify production build and automated tests in GitHub Actions for the Live Map commits.
- [ ] Resolve any browser/CI issues before calling Stage 1 verified.
- [ ] Stage 2 remains separate: research/choose real environmental feeds, validate terms and coverage, and only then integrate real observations. Do not label the current interface live.


### CARTO basemap key configuration
- Live Map reads `VITE_CARTO_API_KEY` from the Vite environment and appends it to CARTO tile requests.
- `.env.example` documents the variable name only. Keep the real key in an ignored local `.env.local` file or restricted environment secret; never commit it.
- Restrict the key to approved origins in CARTO's dashboard. Verify map rendering manually after configuring the environment.

### Stage 1 visual and geographic navigation — Global Health Intelligence (2026-10-28)
- [x] Align the Live Map with the personal journal's light paper/forest-green design system; do not introduce a separate dark/light toggle.
- [x] Use CARTO's light basemap and retain OpenStreetMap/CARTO attribution plus the `VITE_CARTO_API_KEY` environment-variable approach.
- [x] Add a compact header, synthetic-demo notice, summary cards, layer/status/time controls, selected-event intelligence panel, responsive event feed, and synthetic replay timeline.
- [x] Add geographic zoom presets from world view through region, country/state, city/town, village/local area and street/workplace-area scale. These presets change map zoom only; they do not claim health-data coverage at that level.
- [x] Add place-name search using OpenStreetMap Nominatim on explicit form submission (no autocomplete). Search moves the map only and does not imply health reports exist for the selected place.
- [x] Preserve separate personal journal and reviewer-demo routes, fictional event fixtures, and explicit uncertainty / human-review language.
- [ ] Verify the latest Live Map build and automated tests in GitHub Actions.
- [ ] Manually inspect the route on desktop and mobile: light basemap/key loading, place search, zoom presets, marker selection, layer/status/time filters, reset, replay pause/resume, event details, and return-to-journal navigation.
- [ ] Check browser console and confirm the map remains usable if the external map library, tile service, or place search is unavailable.
- [ ] Tune spacing/legibility based on the user's actual browser view. Geographic health reporting is not connected; all displayed event fixtures remain synthetic.
