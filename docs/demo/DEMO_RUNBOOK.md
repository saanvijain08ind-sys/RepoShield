# PRISM Verification Pipeline - 3-Minute Demo Runbook

**Goal**: Deliver a reliable, polished demonstration of the PRISM evidence-grounded verification pipeline, showing ingestion, tri-state claim evaluation, V1 failure reproduction, the exact engineering fix, V2 resolution, and measured benchmark gains in **under 3 minutes** (~140 seconds).

---

## Pre-Flight Checklist (Clean Local Start)

1. **Start Environment**:
   ```bash
   npm run dev
   ```
   *Verify that the server prints:*
   `Security Transition Monitor server running on http://0.0.0.0:3000`

2. **Verify Server Health**:
   ```bash
   curl -s http://localhost:3000/api/health
   # Expected: {"status":"ok","time":"..."}
   ```

3. **Verify Pipeline Test Suite**:
   ```bash
   npm test
   # Expected: 20/20 unit/pipeline tests passed + 10/10 integration tests passed (30/30 total)
   ```

4. **Open Browser**:
   Navigate to `http://localhost:3000`.
   - The default selected tab is **"3-Min Hackathon Demo"** (`#tab-hackathon-demo`).
   - If not selected, click the first tab: **"3-Min Hackathon Demo"**.

---

## 3-Minute Demo Execution Flow

| Step # | Step Title | UI Target / Action | What to Say (Speaker Script) | Timing |
|---|---|---|---|---|
| **Step 1** | **Report Ingestion** | Click **"Load Pre-Packaged Synthetic Report (1-Click)"** (`#btn-load-sample-report`), or drag-and-drop `demo_synthetic_security_report.json`. | *"Welcome. Today we're demonstrating PRISM, an evidence-grounded verification pipeline. Here we ingest a synthetic security audit report with 6 claims across growth milestones, transport encryption, and exposed endpoints."* | **0:00 - 0:18** (18s) |
| **Step 2** | **Tri-State Claims & Provenance** | Click **"Next Step: Tri-State Verification"** (`#btn-next-step`). Filter between **VERIFIED**, **CONTRADICTED**, and **INSUFFICIENT_EVIDENCE**. Click any claim to view the linked evidence. | *"Unlike binary evaluators, PRISM produces three distinct states with full cryptographic provenance. Here you see VERIFIED claims linked to API responses, CONTRADICTED claims linked to raw HTTP probe excerpts, and INSUFFICIENT_EVIDENCE when candidate data is missing."* | **0:18 - 0:48** (30s) |
| **Step 3** | **V1 Failure (Remediation Blindness)** | Click **"Next Step: View V1 PRISM Failure"** (`#btn-next-step`). Inspect the red comparison card. | *"Now let's examine a critical bug in V1: Remediation Blindness. In this scenario, an initial scan found missing HSTS at T0. At T1, the team deployed a valid HSTS header. But V1 treats any historical failure as permanent, falsely marking the fixed endpoint as CONTRADICTED."* | **0:48 - 1:13** (25s) |
| **Step 4** | **Exact Engineering Fix** | Click **"Next Step: Inspect Engineering Fix"** (`#btn-next-step`). Review the temporal provenance ordering diff. | *"To fix this, we implemented temporal provenance resolution in V2. We order candidate observations by collection timestamp descending, so post-remediation evidence supersedes historical snapshots, while neutral telemetry gracefully falls back to INSUFFICIENT_EVIDENCE."* | **1:13 - 1:38** (25s) |
| **Step 5** | **V2 Resolution** | Click **"Next Step: See V2 Result"** (`#btn-next-step`). Observe the green VERIFIED badge with superseded provenance metadata. | *"Under the exact same two-probe scenario, V2 correctly evaluates the latest evidence, marking the claim VERIFIED while explicitly displaying the historical failure as superseded in the audit trail."* | **1:38 - 1:58** (20s) |
| **Step 6** | **Measured Benchmark Metrics** | Click **"Next Step: Measured Benchmark Metrics"** (`#btn-next-step`). Click **"Rerun Benchmark (Live)"** (`#btn-rerun-benchmark`). | *"We benchmarked V1 versus V2 across standard remediation, telemetry, and persistence scenarios: Accuracy increased from 50% to 100%, while false contradictions dropped from 50% to 0%. Every result is reproducible locally in under 30 milliseconds."* | **1:58 - 2:20** (22s) |

**Total Measured Duration**: **140 seconds (~2.3 minutes)**.
Leaves **40 seconds of safety buffer** for judge Q&A.

---

## Contingency / Fallback Procedures

1. **Accidental Page Reload / Navigation**:
   - The app preserves in-memory store and re-renders the default tab.
   - Click **"Reset"** (`#btn-reset-demo`) in the top banner to return to Step 1 in 1 click.

2. **File Upload Testing**:
   - If a judge asks to see a custom file upload instead of the 1-click button:
   - Click **"Download JSON"** (`#btn-download-demo-fixture`) to download `demo_synthetic_security_report.json`.
   - Drag the downloaded file into the dropzone (`#dropzone-synthetic-report`).
   - The report will immediately parse and confirm 6 claims.

3. **Live Benchmark Verification**:
   - Click **"Rerun Benchmark (Live)"** on Step 6.
   - The engine sends a POST request to `/api/verification/v1-v2-comparison/run` and displays refreshed millisecond-level execution timestamps with identical 100% accuracy.

---

## Backup Artifacts & Visual Snapshots

High-fidelity, pixel-accurate vector SVG backup screenshots of every primary demo state are created and stored in the repository at `/docs/demo/screenshots/` and served at `/screenshots/`:

1. **Step 1 - Report Ingestion & 1-Click Load**:
   - Path: `docs/demo/screenshots/step1_report_ingest.svg` (Public URL: `/screenshots/step1_report_ingest.svg`)
   - Captures: Drag-and-drop zone, pre-packaged report 1-click button, active report confirmation card with 6 evaluated claims.

2. **Step 2 - Tri-State Verification & Evidence Provenance**:
   - Path: `docs/demo/screenshots/step2_tri_state_claims_evidence.svg` (Public URL: `/screenshots/step2_tri_state_claims_evidence.svg`)
   - Captures: Verified, Contradicted, and Insufficient Evidence claims side-by-side with raw HTTP probe excerpt inspector and cryptographic hashes.

3. **Step 3 - V1 PRISM Failure (Remediation Blindness)**:
   - Path: `docs/demo/screenshots/step3_v1_remediation_blindness_failure.svg` (Public URL: `/screenshots/step3_v1_remediation_blindness_failure.svg`)
   - Captures: Stale historical probe T0 overriding fresh remediated probe T1, causing false contradiction failure in legacy V1.

4. **Step 4 - Exact Engineering Fix (V1 vs V2 Code Diff)**:
   - Path: `docs/demo/screenshots/step4_engineering_fix_temporal_provenance.svg` (Public URL: `/screenshots/step4_engineering_fix_temporal_provenance.svg`)
   - Captures: Temporal timestamp sorting (`collectedAt` descending) and graceful fallback logic for neutral/inconclusive telemetry.

5. **Step 5 - V2 Resolution (VERIFIED with Superseded Audit Trail)**:
   - Path: `docs/demo/screenshots/step5_v2_resolution_superseded.svg` (Public URL: `/screenshots/step5_v2_resolution_superseded.svg`)
   - Captures: Post-remediation probe T1 evaluated as VERIFIED while preserving historical probe T0 marked as `SUPERSEDED`.

6. **Step 6 - Measured Empirical Benchmark Metrics**:
   - Path: `docs/demo/screenshots/step6_measured_benchmark_metrics.svg` (Public URL: `/screenshots/step6_measured_benchmark_metrics.svg`)
   - Captures: Live benchmark results (+50.0% accuracy improvement, -50.0% false contradiction reduction, 4/4 scenarios passing, zero jitter).

