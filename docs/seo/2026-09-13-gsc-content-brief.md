# DriveHours GSC Content Brief

## Search opportunity

The supplied Google Search Console export has zero clicks but shows early demand for three reader questions: supervised night-driving hours, 50-hour or permit driving logs, and whether a DMV checks logged practice. California, North Carolina, and Ohio state pages are the highest-impression relevant pages.

| Query theme | Reader intent | Route |
| --- | --- | --- |
| Night supervised-driving hours | Find a state-dependent night-hour target | `/night-driving-hours` |
| 50-hour / permit driving log | Understand what to put in a practice record | `/50-hour-driving-log` |
| DMV verification | Prepare documentation for a licensing appointment | `/does-dmv-check-driving-hours` |

## Primary-source records

| State | Official source | Retrieved | Supported fact used by DriveHours |
| --- | --- | --- | --- |
| California | [California DMV Teen Driver Roadmap](https://www.dmv.ca.gov/portal/teen-drivers/) | 2026-09-13 | The DMV states that teen drivers need 50 supervised practice hours, including 10 at night, and provides a practice-log PDF. |
| North Carolina | [NCDMV Level 2 Limited Provisional License](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Pages/level2.aspx) | 2026-09-13 | The agency requires a driving log showing at least 60 hours for the Level 2 road-test process; digital and printed copies are accepted. |
| Ohio | [Ohio BMV Under-18 Licensing](https://bmv.ohio.gov/dl-gdl.aspx) | 2026-09-13 | Ohio specifies 50 driving hours with at least 10 night hours and tells applicants to bring completed BMV 5791 to the driving-test appointment. |

## Copy rules

- A 50-hour requirement is not universal. Each national guide must direct readers to the relevant state guide and official licensing agency.
- Night-driving definitions and documentation requirements vary by state. Never give one national clock-time rule or promise a universally accepted format.
- The DMV-verification guide explains how to prepare a clear record; it does not predict enforcement, claim a DMV always checks, or give legal advice.
- DriveHours helps people organize supervised-practice records. It is not a DMV, an official state form, or a substitute for the current state instructions.
- The existing local `US_STATES` data remains the only source for the state table; the public state pages keep their existing official-source links.
