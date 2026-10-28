# NxHeal

**Your health journey, understood.**

NxHeal is a mobile-first personal health-tracking Progressive Web App (PWA) being developed for the Future Health Digital Innovation Challenge.

## Current prototype

The current MVP supports:

- Recording symptom episodes, onset dates, severity, and optional notes.
- Separating symptoms, suspected conditions, and user-reported conditions (which are not independently verified).
- Reviewing personal episode history and updating an episode's recovery status.
- Deleting an episode after confirmation.
- Preparing, reviewing, and editing a personal health summary before downloading or printing it.
- Saving episodes in this browser's local storage on this device.
- An initial PWA manifest and service-worker caching implementation; real-device installation and offline behaviour still require manual verification.

The current interface uses in-page sections, not a multi-route application. Community-health monitoring, environment data, user accounts, and a cloud backend are not implemented yet.

## Run locally

Requirements: Node.js 20 or a compatible current Node.js release, and npm.

```sh
npm install
npm run dev
```

To run the automated tests and production build:

```sh
npm test
npm run build
```

To preview the production build locally:

```sh
npm run preview
```

The Vite build is configured to use relative asset paths so it can be hosted at a domain root or a project subpath. The actual hosting configuration and installed-PWA behaviour must still be tested on the intended host.

## Privacy and safety

**Do not use this prototype to store real personal health information.** The current app has not completed security, privacy, clinical-safety, accessibility, or real-device testing. Entries are stored in browser local storage and are not sent to a server. They are not automatically backed up or synchronised between devices, and someone with access to the unlocked browser profile may be able to access them.

NxHeal does not diagnose conditions or replace qualified medical care. Do not delay emergency care to use this app. Suspected conditions and user-reported diagnoses are not independently verified by NxHeal.

Never commit passwords, API keys, access tokens, or real health records to this repository. Any future demo health data or alerts must be clearly labelled as synthetic and must not be presented as real public-health findings.

## Planned direction

1. Finish browser and mobile acceptance checks for the personal-health journey and PWA.
2. Review accessibility, privacy, and safety wording.
3. Research suitable environment and public-health data sources and the actual challenge requirements.
4. Design separate Health Environment, Community Health, Alerts, and Health Summary experiences only after the core flow is dependable.
5. If cloud reporting is introduced, implement authentication, server-side access controls, consent/purpose rules, and privacy-preserving aggregation before handling real health data.

## Development status

This is an early-stage prototype. Check [`BUILD_CHECKLIST.md`](BUILD_CHECKLIST.md) for the distinction between implemented features and items that have actually been verified. The development work is being done on the `feat/mvp-foundation` branch; the `main` branch is not being changed as part of this work.
