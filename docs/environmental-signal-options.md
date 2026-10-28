# NxHeal environmental signal source assessment

> Status: initial source assessment for prototyping, not an integration or validation claim. Checked 28 October 2026.

## Decision summary

Do not connect a live environmental API to the user-facing app yet. First agree on the demo geography and decide whether we need current conditions, forecasts, or historical baselines. Keep the personal symptom journal independent from any future environmental or population-health data pipeline.

For an initial demonstrator, use a small, clearly labelled dataset and show the source, observation/forecast time, geographic resolution, and any missing/stale values. Do not use environmental data alone to infer a health event.

## Candidate sources

### 1. Nigerian Meteorological Agency (NiMet)

Official API documentation: https://nimet.gov.ng/weatherapi

The documentation describes API-key authentication, station listings, three-day forecasts, historical dataset access, and temperature information. Its examples include Ikeja in Lagos. This makes NiMet a strong candidate to evaluate for a Nigeria-focused prototype.

Before integration:
- Register and confirm account/API access and any applicable usage terms.
- Verify which forecast variables are available (especially humidity, heat-related measures, and update frequency); do not assume that all are exposed.
- Check geographic coverage, station metadata, timestamps/time zone, units, data quality, rate limits, and attribution requirements.
- Keep any API key out of client-side source code; proxy protected requests through a controlled backend if needed.

### 2. Open-Meteo

Official API and data details: https://open-meteo.com/  
Pricing/licensing details: https://open-meteo.com/en/pricing

Open-Meteo documents current and forecast weather endpoints and historical datasets, with hourly temperature and relative-humidity variables among its examples. It can be useful for a fast prototype and for building historical context.

Important constraints:
- Its free hosted API is described as intended for non-commercial use, with a daily request limit; commercial use requires reviewing the appropriate plan/licence.
- Attribution under CC BY 4.0 is required for the data.
- Forecast/model data is not the same as a local ground observation. Display source and timestamp, and avoid presenting forecast values as measured conditions.
- Review its terms again before a public or commercial deployment.

### 3. AirQo

Official API product page: https://airqo.org/products/api  
API documentation: https://docs.airqo.net/airqo-rest-api-documentation

AirQo offers air-quality measurements and describes real-time, historical, and forecast data. Its published plans indicate a free tier with limited access and paid options for expanded history/forecast features. This could be a candidate for African-city air-quality context, subject to verifying coverage for the selected geography.

Before integration:
- Confirm relevant monitoring-site coverage and the freshness of measurements for the target area.
- Confirm plan limits, token handling, permitted use, and attribution.
- Keep raw readings, calibrated readings, and any derived category distinguishable.
- Do not show an air-quality value for an area where coverage is absent or too distant to be representative.

## Recommended first demonstrator

Use one selected area and a narrow scenario, for example: hot conditions plus a synthetic increase in user-reported dizziness, headache, or fatigue. Clearly label symptom data as synthetic. Show environmental conditions as context that may warrant review, not proof that the weather caused symptoms.

The interface should disclose:
- source and timestamp for each environmental value;
- whether the value is observed, forecast, historical, or synthetic;
- area/station/grid resolution and known coverage limitations;
- missing or stale data;
- why the combined pattern was flagged for human review.

Do not calculate or display a medical diagnosis, definitive outbreak declaration, or unsupported live risk percentage.

## Public-health workflow guardrail

WHO's Early Warning, Alert and Response guidance describes a process that includes detection, triage, verification, risk assessment, investigation, and response. NxHeal should model any signal as a prompt for qualified human review, not as a confirmed event.

Reference: https://www.who.int/publications/i/item/9789240063587

WHO surveillance benchmark also emphasises verification/investigation, data management and sharing, and protection of medical confidentiality:
https://ihrbenchmark.who.int/document/10-surveillance

## Next decision before coding

Choose the first demo geography (for example, a specific city or district) and decide whether the initial screen needs:
1. current conditions only;
2. current conditions plus forecast; or
3. current conditions plus forecast and a historical baseline.

Recommendation: begin with current conditions plus forecast for one area, and use clearly labelled synthetic health signals. Add a historical baseline only after confirming the source and temporal coverage.
