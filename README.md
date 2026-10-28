# NxHeal

**Your health journey, understood.**

NxHeal is being developed as a global, user-centred health reporting and early-warning platform for the Future Health Digital Innovation Challenge. Its core idea is to put health reporting into people's hands: individuals record the symptoms and health experiences they feel, while properly designed future capabilities could help authorised health organisations understand privacy-protected patterns from communities and workforces up to wider regional and global levels. User reports are intended to complement—not replace—clinical, institutional, and authoritative external reporting.

## Current prototype

The current MVP supports:

- Recording symptom episodes, onset dates, severity, and optional notes.
- Separating symptoms, suspected conditions, and user-reported conditions (which are not independently verified).
- Reviewing personal episode history and updating an episode's recovery status.
- Deleting an episode after confirmation.
- Preparing, reviewing, and editing a personal health summary before downloading or printing it.
- Saving episodes in this browser's local storage on this device.
- An initial PWA manifest and service-worker caching implementation; real-device installation and offline behaviour still require manual verification.

The current interface uses in-page sections, not a multi-route application. The current prototype is only the personal-reporting foundation: user reports stay in this browser and are not sent to a central monitoring system. Community/workforce monitoring, geographic aggregation, environmental or external event data, user accounts, and a cloud backend are not implemented yet.

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

## Intended product model

NxHeal is designed around a path from the individual to the wider population:

1. **Individual reporting:** people record symptoms and health experiences themselves and can access relevant health information.
2. **Community and workforce signals:** appropriately authorised reports may be assessed in aggregate to identify patterns that deserve review.
3. **Geographic roll-up:** where data volume, quality, permissions, and privacy thresholds permit, signals can be summarised from small communities (such as neighbourhoods or villages) to towns, cities, regions/states, countries, continents, and the world.
4. **Relevant context:** suitable external health advisories, environmental observations, and event reports can help contextualise patterns, but timing or proximity alone must never be treated as proof of cause.
5. **Review and action:** potential signals are explained with coverage, missingness, uncertainty, and source information. They are not diagnoses or confirmed outbreaks; appropriate human review and authoritative verification are required before formal warnings.

These are intended capabilities, not features that are already implemented. Personal health details remain private by default. Employers, community reviewers, and authorities must not automatically receive individual records. Any future central reporting requires clear consent/purpose rules, appropriate legal authorisation, authentication, server-side access controls, data minimisation, retention rules, privacy-preserving aggregation, and small-group suppression. The system must visibly communicate gaps and uneven participation rather than imply complete global coverage.

## Planned direction

1. Finish browser and mobile acceptance checks for the personal-health journey and PWA.
2. Review accessibility, privacy, and medical-safety wording.
3. Define the challenge demonstration around the individual → community/workforce → wider population model.
4. Design and test the user-submitted reporting pathway, geographic hierarchy, data-quality checks, and privacy-protective aggregation using clearly labelled synthetic data.
5. Research suitable authoritative health, environmental, and event data sources and verify their coverage, terms, timestamps, and access before integration.
6. If cloud reporting is introduced, implement authentication, server-side access controls, consent/purpose rules, retention policies, and privacy-preserving aggregation before handling real health data.

## Development status

This is an early-stage prototype. Check [`BUILD_CHECKLIST.md`](BUILD_CHECKLIST.md) for the distinction between implemented features and items that have actually been verified. The development work is being done on the `feat/mvp-foundation` branch; the `main` branch is not being changed as part of this work.
