# NxHeal early-warning landscape: initial desk review

**Status:** Initial hypothesis, not a completed competitor analysis. Reviewed 28 October 2026. This note should be updated as more systems, deployment contexts, and the official challenge requirements are checked.

## What existing systems already do

| System / guidance | Existing capability established by its official documentation | What this means for NxHeal |
| --- | --- | --- |
| Google Android Earthquake Alerts | Uses aggregated Android phone motion signals to detect earthquakes and deliver geographically relevant warnings. It is an event-specific physical-hazard detection and alerting system. | NxHeal should not position itself as a generic alert-distribution clone. The sensing method and health problem are different. |
| CDC National Syndromic Surveillance Program (NSSP) / BioSense Platform | Combines near-real-time health signals, including emergency-department data, to help public-health teams detect and monitor illness, injury, environmental threats, and emerging health events. | Broad symptom-pattern detection and multi-source surveillance already exist. A dashboard that merely counts symptoms is not a defensible gap. NSSP is US-specific; it is a reference for capability, not proof of availability or fit in every country. |
| WHO Early Warning, Alert and Response (EWAR) guidance | Describes operational processes for early detection, triage, verification, risk assessment, investigation, and response during emergencies. | NxHeal must account for verification, human review, response ownership, privacy, and coordination—not only anomaly detection. This is operational guidance, not a direct product competitor. |
| WHO International Health Regulations monitoring benchmark | Emphasises established early-warning surveillance, event verification and investigation, coordination, and secure handling of sensitive information. | Any claimed gap should be grounded in the actual local surveillance ecosystem and its workflow/capacity gaps. |

## Initial product implications

1. **Do not claim uniqueness yet.** Established syndromic surveillance already combines symptoms and multiple data sources. More research is needed on products used in the challenge's target geography, community reporting tools, occupational-health platforms, and existing government systems.
2. **Potential gap hypothesis to validate:** a lightweight, mobile-first reporting and triage layer that can work with sparse or delayed community-level reports and authorised environmental/workforce signals, then explain *why* a pattern deserves human review. The value would be practical workflow, local fit, data quality transparency, and responsible escalation—not a novel claim that no one else detects health patterns.
3. **Keep personal and organisational data separate.** Personal episode details should remain private by default. Workforce or community insights must use appropriately authorised, minimum-necessary data, with aggregation and small-group protections.
4. **Use a staged response model:** signal detected → quality and baseline checks → authorised human review → verification/investigation → alert issued by the responsible authority where warranted. A rise in app reports alone must not trigger a public emergency alert.
5. **Use synthetic data for the prototype** and clearly label it. Demonstrate the reasoning, data coverage, missingness, uncertainty, and review steps without implying a live outbreak or validated predictive performance.

## Questions to answer before designing an early-warning interface

- Which country, authority, community, or workforce setting is the first intended deployment context?
- Which official surveillance channels and data sources already exist there, and where are their documented gaps?
- Who is authorised to receive a signal, verify it, and issue a public advisory?
- Can a proposed signal be evaluated against a suitable reference dataset or expert review?
- What minimum aggregation threshold and suppression rules prevent identification of individuals or small groups?
- What does NxHeal add to the existing workflow that is useful, feasible, and measurable?

## Official sources reviewed

- Google, [Android Earthquake Alerts: A global system for early warning](https://research.google/blog/android-earthquake-alerts-a-global-system-for-early-warning/).
- Google Android Help, [Get help during an emergency with your Android phone](https://support.google.com/android/answer/9319337).
- US Centers for Disease Control and Prevention, [About the National Syndromic Surveillance Program](https://www.cdc.gov/nssp/php/about/index.html).
- US Centers for Disease Control and Prevention, [BioSense Platform](https://www.cdc.gov/nssp/php/about/about-nssp-and-the-biosense-platform.html).
- World Health Organization, [Surveillance in emergencies](https://www.who.int/emergencies/surveillance).
- World Health Organization, [Early warning alert and response (EWAR) in emergencies: an operational guide](https://www.who.int/publications/i/item/9789240063587).
- World Health Organization, [IHR Benchmark: Surveillance](https://ihrbenchmark.who.int/document/10-surveillance).

## Scope boundary

This review does not establish clinical validity, regulatory compliance, a complete market comparison, or a verified gap. Before real-world deployment, NxHeal would need local stakeholder input, privacy/security review, appropriate data-sharing agreements, and evaluation against suitable evidence.
