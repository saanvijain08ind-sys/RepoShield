# PRISM Demo Video Recording Checklist

Since automated headless desktop video capture (e.g. ffmpeg screen capture daemon) is restricted in the sandboxed container environment, this checklist provides the exact technical and operational specifications for recording a high-fidelity 3-minute video presentation.

---

## 1. Technical Recording Environment
- **Resolution**: 1920x1080 (1080p, 16:9 aspect ratio)
- **Frame Rate**: 60 fps (minimum 30 fps)
- **Audio Sample Rate**: 48 kHz / 24-bit PCM or AAC-LC (minimum 192 kbps)
- **Browser**: Chromium or Chrome (Clean profile, dark mode enabled)
- **Browser Zoom**: 100% (reset with `Cmd+0` or `Ctrl+0`)
- **DevTools**: Hidden / Closed during presentation
- **Window Frame**: Full screen or clipped to browser viewport (hide OS taskbar / dock)
- **Mouse Cursor**: Visible with subtle click halo (e.g., Screenflow / OBS / Loom pointer smoothing enabled)

---

## 2. Pre-Recording System State
- [ ] Server running: `npm run dev` running cleanly on port 3000
- [ ] Health check passing: `curl -s http://localhost:3000/api/health` returns `{"status":"ok"}`
- [ ] Terminal test run completed: `npm test` passing with 30/30 tests
- [ ] Tab selected: Navigate to `http://localhost:3000` -> Click **"3-Min Hackathon Demo"** tab
- [ ] State reset: Click **"Reset"** in top banner to verify Step 1 is active

---

## 3. Shot-by-Shot Recording Schedule (Total Duration: 2m 20s)

### Scene 1: Introduction & Ingestion (0:00 - 0:20 | 20s)
- **Visual**: Focus on Step 1 ("1. Report Ingestion").
- **Action**: Hover over the drag-and-drop zone, then click **"Load Pre-Packaged Synthetic Report (1-Click)"**.
- **Visual Feedback**: Emerald confirmation banner appears: *"Report Processed Successfully: Loaded pre-packaged synthetic audit report (6 claims...)"*.
- **Spoken Audio**:
  > "Welcome. I am presenting PRISM, an evidence-grounded verification pipeline designed to validate security claims against empirical telemetry. In Step 1, we ingest an independent synthetic security audit report with 6 evaluation criteria."

### Scene 2: Tri-State Verification & Evidence Provenance (0:20 - 0:50 | 30s)
- **Visual**: Click **"Next Step: Tri-State Verification"** to enter Step 2.
- **Action**:
  1. Click the **VERIFIED** claim (`claim_github_stars`) -> show the linked GitHub API excerpt (`stargazers_count: 1240`).
  2. Click the **CONTRADICTED** claim (`claim_no_git_exposure`) -> show the linked HTTP probe excerpt (`ref: refs/heads/main`).
  3. Click the **INSUFFICIENT_EVIDENCE** claim (`claim_dns_caa_authorization`) -> show the explanation: *"No candidate evidence found. Supporting evidence is absent."*
- **Spoken Audio**:
  > "Unlike traditional binary checkers that guess when data is missing, PRISM strictly produces three states: VERIFIED, CONTRADICTED, and INSUFFICIENT_EVIDENCE. Every verdict is cryptographically linked to evidence provenance with raw excerpts, timestamps, and SHA-256 hashes."

### Scene 3: V1 Failure Demonstration (0:50 - 1:15 | 25s)
- **Visual**: Click **"Next Step: View V1 PRISM Failure"** to enter Step 3.
- **Action**: Scroll smoothly down the comparison card. Highlight the two conflicting probes:
  - Probe T0 (yesterday): `Strict-Transport-Security: absent`
  - Probe T1 (today): `Strict-Transport-Security: max-age=31536000`
- **Visual Feedback**: Red callout highlighting: *"V1 Produced: CONTRADICTED (Failure)"*.
- **Spoken Audio**:
  > "In Step 3, we reproduce a known flaw in legacy PRISM V1: Remediation Blindness. Here, a website initially lacked HSTS at T0. At T1, the engineers deployed a valid HSTS header. But V1's evaluation logic treats any historical failure as an absolute contradiction, blinding it to successful remediations."

### Scene 4: Exact Engineering Fix (1:15 - 1:40 | 25s)
- **Visual**: Click **"Next Step: Inspect Engineering Fix"** to enter Step 4.
- **Action**: Highlight the two code difference panels:
  - Provenance Ordering: `candidateEvidence.sort((a,b) => new Date(b.collectedAt) - new Date(a.collectedAt))`
  - Neutral Telemetry: Fallback to `INSUFFICIENT_EVIDENCE` rather than false contradiction.
- **Spoken Audio**:
  > "To resolve this, our engineering fix implements temporal provenance resolution. Candidate observations are deterministically ordered by collection timestamp, allowing recent verified observations to supersede outdated snapshots. Furthermore, neutral logs that lack evidence default to INSUFFICIENT_EVIDENCE."

### Scene 5: V2 Resolution on Identical Scenario (1:40 - 2:00 | 20s)
- **Visual**: Click **"Next Step: See V2 Result"** to enter Step 5.
- **Action**: Point to the emerald **VERIFIED** badge and the secondary **SUPERSEDED** indicator on the historical probe.
- **Spoken Audio**:
  > "Now looking at the exact same two-probe scenario under V2, the claim is evaluated as VERIFIED. The engine correctly recognizes the remediation while retaining the historical failure in the audit log marked as superseded."

### Scene 6: Measured Benchmark Metrics (2:00 - 2:20 | 20s)
- **Visual**: Click **"Next Step: Measured Benchmark Metrics"** to enter Step 6.
- **Action**:
  1. Highlight the metric cards: Accuracy (+50.0%), False Contradictions (-50.0%).
  2. Click **"Rerun Benchmark (Live)"** to prove live execution.
- **Spoken Audio**:
  > "Finally, we benchmarked V1 against V2 across our scenario suite. Accuracy increased from 50% to 100%, and false contradictions fell from 50% to 0%. The complete pipeline runs deterministically and locally in milliseconds. Thank you."

---

## 4. Post-Recording Quality Checklist
- [ ] No audio clipping or hum (normalize peaks to -1 dB, RMS to -16 LUFS)
- [ ] Text legible at 1080p without blurry compression artifacts
- [ ] Video runtime strictly between 2m 10s and 2m 30s (< 180s)
- [ ] Export format: MP4 container with H.264 / AAC codecs
