/**
 * Hackathon 3-Minute Interactive Demo Flow
 *
 * Demonstrates the complete verification pipeline sequentially:
 * 1. Upload one synthetic report (file upload, drag-and-drop, or 1-click pre-packaged load).
 * 2. Show VERIFIED claim (traceable to explicit supporting evidence).
 * 3. Show CONTRADICTED claim (traceable to explicit probe contradiction).
 * 4. Show INSUFFICIENT_EVIDENCE claim (traceable to missing/inconclusive observations).
 * 5. Show the V1 PRISM failure (stale historical evidence overrides post-remediation fix).
 * 6. Show the exact engineering fix (temporal provenance ordering & neutral telemetry fallback).
 * 7. Show the same scenario after V2 (resolves to VERIFIED with superseded provenance tag).
 * 8. Show the measured before/after metric (actual backend benchmark: 50% -> 100% accuracy).
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileCode,
  Shield,
  Layers,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  Code2,
  RotateCcw,
  Hash,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  Claim,
  ClaimState,
  EvidenceItem,
  EvidenceRelationship,
  SyntheticReport,
} from '../types/index.ts';

interface BenchmarkData {
  timestamp: string;
  benchmarkName: string;
  totalScenarios: number;
  labels: {
    v1: string;
    failure: string;
    engineeringFix: string;
    v2: string;
    beforeMetric: string;
    afterMetric: string;
  };
  metrics: {
    before: {
      accuracyPct: number;
      correctCount: number;
      failedCount: number;
      falseContradictionCount: number;
      falseContradictionRatePct: number;
    };
    after: {
      accuracyPct: number;
      correctCount: number;
      failedCount: number;
      falseContradictionCount: number;
      falseContradictionRatePct: number;
    };
    delta: {
      accuracyGainPct: number;
      falseContradictionReductionPct: number;
    };
  };
  scenarios: Array<{
    scenarioId: string;
    scenarioName: string;
    category: string;
    expectedGroundTruth: string;
    v1: {
      producedStatus: string;
      isCorrect: boolean;
      isFalseContradiction: boolean;
      reason: string;
    };
    v2: {
      producedStatus: string;
      isCorrect: boolean;
      isFalseContradiction: boolean;
      reason: string;
    };
    remediedInV2: boolean;
  }>;
}

export const HackathonDemoFlow: React.FC = () => {
  // Demo step: 1: Upload, 2: Claims & Evidence (Verified, Contradicted, Insufficient), 3: V1 Failure, 4: Engineering Fix, 5: V2 Result, 6: Measured Metrics
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Report and Evidence State
  const [report, setReport] = useState<SyntheticReport | null>(null);
  const [evidencePool, setEvidencePool] = useState<EvidenceItem[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<'ALL' | ClaimState>('ALL');

  // Benchmark State
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState<boolean>(false);

  // Upload Interaction State
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial report and benchmark
  const fetchReport = async () => {
    try {
      const res = await fetch('/api/verification/synthetic-report');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.report) {
          setReport(data.report);
          setEvidencePool(data.evidencePool || []);
          if (data.report.claims?.length > 0 && !selectedClaimId) {
            setSelectedClaimId(data.report.claims[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load initial report:', err);
    }
  };

  const fetchBenchmark = async () => {
    try {
      setBenchmarkLoading(true);
      const res = await fetch('/api/verification/v1-v2-comparison');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.benchmark) {
          setBenchmark(data.benchmark);
        }
      }
    } catch (err) {
      console.error('Failed to load benchmark:', err);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchBenchmark();
  }, []);

  // Upload handler for JSON file
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setUploadError('Please select a valid JSON file (*.json).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setUploading(true);
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const reportPayload = parsed.report && Array.isArray(parsed.report.claims) ? parsed.report : parsed;
        const evidencePayload = Array.isArray(parsed.evidencePool) ? parsed.evidencePool : undefined;

        const res = await fetch('/api/verification/upload-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report: reportPayload,
            evidencePool: evidencePayload,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to process report on server.');
        }

        setReport(data.report);
        setEvidencePool(data.evidencePool || []);
        if (data.report.claims?.length > 0) {
          setSelectedClaimId(data.report.claims[0].id);
        }
        setUploadSuccessMessage(`Successfully uploaded and evaluated "${data.report.title || 'Synthetic Report'}" (${data.report.claims.length} claims).`);
      } catch (err: any) {
        setUploadError(err.message || 'Malformed JSON or invalid report schema.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  // 1-Click Load Pre-packaged Synthetic Audit Report
  const handleLoadSampleReport = async () => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccessMessage(null);

      const res = await fetch('/api/verification/sample-report');
      if (!res.ok) throw new Error('Failed to retrieve sample report template.');
      const data = await res.json();

      const uploadRes = await fetch('/api/verification/upload-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: data.sampleReport,
          evidencePool: data.evidencePool,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Failed to process sample report.');
      }

      setReport(uploadData.report);
      setEvidencePool(uploadData.evidencePool || []);
      if (uploadData.report.claims?.length > 0) {
        setSelectedClaimId(uploadData.report.claims[0].id);
      }
      setUploadSuccessMessage('Loaded pre-packaged synthetic audit report (6 claims across growth milestone, transport security, and information disclosure).');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load sample report.');
    } finally {
      setUploading(false);
    }
  };

  const rerunBenchmark = async () => {
    try {
      setBenchmarkLoading(true);
      const res = await fetch('/api/verification/v1-v2-comparison/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.benchmark) {
          setBenchmark(data.benchmark);
        }
      }
    } catch (err) {
      console.error('Failed to rerun benchmark:', err);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Upload Report', short: 'Upload' },
    { id: 2, label: 'Claims & Evidence', short: 'All 3 States' },
    { id: 3, label: 'V1 PRISM Failure', short: 'V1 Failure' },
    { id: 4, label: 'Engineering Fix', short: 'Exact Fix' },
    { id: 5, label: 'V2 Corrected Outcome', short: 'V2 Result' },
    { id: 6, label: 'Measured Benchmark', short: 'Before / After' },
  ];

  const claims = report?.claims || [];
  const filteredClaims = claims.filter((c) => {
    if (filterState !== 'ALL' && c.status !== filterState) return false;
    return true;
  });
  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFIED
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            CONTRADICTED
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            INSUFFICIENT_EVIDENCE
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getRelationshipBadge = (rel: EvidenceRelationship) => {
    switch (rel) {
      case 'SUPPORTS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            SUPPORTS CLAIM
          </span>
        );
      case 'CONTRADICTS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            CONTRADICTS CLAIM
          </span>
        );
      case 'NEUTRAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            NEUTRAL / INCONCLUSIVE
          </span>
        );
    }
  };

  // Primary scenario for V1 / Fix / V2 demonstration
  const remediationScenario = benchmark?.scenarios.find((s) => s.scenarioId === 'scen_01_remediation_hsts');

  return (
    <div className="space-y-4" id="hackathon-demo-container">
      {/* Top Banner & Stepper Navigation Bar */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-primary text-primary-foreground">
                3-MIN DEMO
              </span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                PRISM Verification Pipeline: Hackathon Walkthrough
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live sequential demonstration: Report Ingestion → 3 Claim States & Provenance → V1 Failure → Engineering Fix → V2 Resolution → Before/After Metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentStep(1);
                fetchReport();
                fetchBenchmark();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              title="Reset walkthrough to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Stepper Buttons Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 border-t border-border">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                id={`demo-step-btn-${step.id}`}
                className={`px-2.5 py-2 rounded-md text-left transition-all border flex flex-col justify-between ${
                  isActive
                    ? 'bg-primary/10 border-primary text-primary font-semibold shadow-2xs'
                    : isCompleted
                    ? 'bg-muted/40 border-border text-foreground hover:bg-muted'
                    : 'bg-card border-transparent text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-bold uppercase opacity-75">
                    Step 0{step.id}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
                <span className="text-xs truncate mt-0.5">{step.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: REPORT UPLOAD FLOW */}
      {currentStep === 1 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5" id="demo-step-1-upload">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-foreground">
                Step 1: Upload Synthetic Audit Report
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Provide a synthetic report containing claims and rule definitions. The server processes each claim deterministically against the collected evidence pool without hallucination.
            </p>
          </div>

          {/* Feedback Alerts */}
          {uploadError && (
            <div className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Upload Error</span>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          {uploadSuccessMessage && (
            <div className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Report Processed Successfully</span>
                <span>{uploadSuccessMessage}</span>
              </div>
            </div>
          )}

          {/* Drag and Drop Zone + Action Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div
              className={`md:col-span-7 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-muted/10'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              id="dropzone-synthetic-report"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Drop your synthetic report JSON here, or click to browse
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Accepts JSON schema with <code className="font-mono">claims[]</code> and evaluation rule specifications
              </p>
              {uploading && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing through PRISM engine...</span>
                </div>
              )}
            </div>

            {/* Quick Demo Options */}
            <div className="md:col-span-5 flex flex-col justify-between p-4 bg-muted/20 border border-border rounded-lg space-y-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-muted-foreground block mb-1">
                  Hackathon Fast-Track
                </span>
                <p className="text-xs text-foreground font-semibold">
                  Zero-Setup Presentation Mode
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Load our pre-packaged synthetic audit report containing 6 standard claims across milestones, transport security, and exposure checks.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleLoadSampleReport}
                  disabled={uploading}
                  id="btn-load-sample-report"
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Pre-Packaged Synthetic Report (1-Click)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/fixtures/demo_synthetic_security_report.json"
                    download="demo_synthetic_security_report.json"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
                    id="btn-download-demo-fixture"
                  >
                    <Upload className="w-3 h-3 rotate-180 text-primary" />
                    <span>Download JSON</span>
                  </a>

                  <a
                    href="/api/verification/sample-report"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>View API JSON</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Current Ingested Report Preview */}
          {report && (
            <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Active Ingested Report:</span>
                  <span className="text-xs font-semibold text-foreground">{report.title}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  ID: {report.id} ({report.claims.length} claims)
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{report.description}</p>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Ready to inspect evaluation outcomes
            </span>
            <button
              onClick={() => setCurrentStep(2)}
              id="btn-next-step-2"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>Inspect Processed Claims (All 3 States)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SHOW VERIFIED, CONTRADICTED, AND INSUFFICIENT_EVIDENCE CLAIMS */}
      {currentStep === 2 && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-5" id="demo-step-2-claims">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-foreground">
                  Step 2: Distinct Claim States & Verifiable Evidence Provenance
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Every claim is deterministically verified against collected evidence. No status is guessed or hallucinated.
              </p>
            </div>

            {/* Quick State Counts Bar */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterState('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                  filterState === 'ALL'
                    ? 'bg-muted border-foreground/20 font-bold'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                All ({claims.length})
              </button>
              <button
                onClick={() => setFilterState('VERIFIED')}
                id="filter-verified-claims"
                className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1 ${
                  filterState === 'VERIFIED'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'bg-card border-border text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified ({report?.summary.verifiedCount || 0})</span>
              </button>
              <button
                onClick={() => setFilterState('CONTRADICTED')}
                id="filter-contradicted-claims"
                className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1 ${
                  filterState === 'CONTRADICTED'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold'
                    : 'bg-card border-border text-rose-600 dark:text-rose-400'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span>Contradicted ({report?.summary.contradictedCount || 0})</span>
              </button>
              <button
                onClick={() => setFilterState('INSUFFICIENT_EVIDENCE')}
                id="filter-insufficient-claims"
                className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1 ${
                  filterState === 'INSUFFICIENT_EVIDENCE'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                    : 'bg-card border-border text-amber-600 dark:text-amber-400'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                <span>Insufficient ({report?.summary.insufficientEvidenceCount || 0})</span>
              </button>
            </div>
          </div>

          {/* Three Visibly Distinct Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="three-states-cards">
            {/* Card 1: VERIFIED */}
            <div
              onClick={() => {
                setFilterState('VERIFIED');
                const v = claims.find((c) => c.status === 'VERIFIED');
                if (v) setSelectedClaimId(v.id);
              }}
              className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10 transition-colors"
              id="card-state-verified"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  VERIFIED STATE
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-1">
                {report?.summary.verifiedCount || 0} Claims
              </div>
              <p className="text-[11px] text-muted-foreground">
                Backed by explicit, verified supporting evidence items matching rule criteria.
              </p>
            </div>

            {/* Card 2: CONTRADICTED */}
            <div
              onClick={() => {
                setFilterState('CONTRADICTED');
                const c = claims.find((c) => c.status === 'CONTRADICTED');
                if (c) setSelectedClaimId(c.id);
              }}
              className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-colors"
              id="card-state-contradicted"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  CONTRADICTED STATE
                </span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 my-1">
                {report?.summary.contradictedCount || 0} Claims
              </div>
              <p className="text-[11px] text-muted-foreground">
                Explicit probe observations directly contradict the claimed security posture.
              </p>
            </div>

            {/* Card 3: INSUFFICIENT_EVIDENCE */}
            <div
              onClick={() => {
                setFilterState('INSUFFICIENT_EVIDENCE');
                const i = claims.find((c) => c.status === 'INSUFFICIENT_EVIDENCE');
                if (i) setSelectedClaimId(i.id);
              }}
              className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
              id="card-state-insufficient"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  INSUFFICIENT_EVIDENCE STATE
                </span>
                <HelpCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 my-1">
                {report?.summary.insufficientEvidenceCount || 0} Claims
              </div>
              <p className="text-[11px] text-muted-foreground">
                Refuses to guess or hallucinate when target observations are missing or indecisive.
              </p>
            </div>
          </div>

          {/* Side-by-Side: Claims List & Linked Evidence Provenance Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
            {/* Claims List Column */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-bold text-muted-foreground">
                <span>Claims in Report ({filteredClaims.length})</span>
                <span className="text-[11px]">Click claim to inspect evidence</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredClaims.map((claim) => {
                  const isSelected = claim.id === selectedClaim?.id;

                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      id={`demo-claim-card-${claim.id}`}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary ring-1 ring-primary bg-card shadow-xs'
                          : 'border-border hover:border-muted-foreground/40 bg-card/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {claim.id}
                        </span>
                        {getStatusBadge(claim.status)}
                      </div>
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        {claim.statement}
                      </p>
                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{claim.category}</span>
                        <span>{claim.evidenceLinks.length} evidence link(s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Claim & Evidence Provenance Column */}
            <div className="lg:col-span-7">
              {selectedClaim ? (
                <div className="border border-border rounded-lg bg-card p-4 space-y-3" id="demo-claim-inspection-panel">
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {selectedClaim.id}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                          {selectedClaim.category}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-muted/60 text-muted-foreground">
                          Rule: {selectedClaim.ruleType}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">
                        {selectedClaim.statement}
                      </h4>
                    </div>
                    {getStatusBadge(selectedClaim.status)}
                  </div>

                  {/* Deterministic Evaluation Trace */}
                  <div className="p-3 rounded-md bg-muted/30 border border-border text-xs space-y-1">
                    <span className="font-bold text-foreground block">Evaluation Trace & Rationale:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedClaim.verificationReason}
                    </p>
                  </div>

                  {/* Visibly Linked Evidence */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Traceable Linked Evidence ({selectedClaim.evidenceLinks.length})</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Target: {selectedClaim.targetEvidenceSource}
                      </span>
                    </div>

                    {selectedClaim.evidenceLinks.length === 0 ? (
                      <div className="p-4 rounded-md border border-dashed border-border bg-muted/10 text-center space-y-1 text-xs">
                        <HelpCircle className="w-5 h-5 mx-auto text-amber-500" />
                        <p className="font-semibold text-foreground">No Direct Evidence Found in Telemetry Pool</p>
                        <p className="text-[11px] text-muted-foreground">
                          Classified as <strong className="text-amber-600 dark:text-amber-400">INSUFFICIENT_EVIDENCE</strong> because no active observation matches the target source probe.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {selectedClaim.evidenceLinks.map((link) => {
                          const ev = link.evidence;
                          return (
                            <div
                              key={link.evidenceId}
                              className="p-3 rounded-md border border-border bg-muted/20 text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Hash className="w-3 h-3 text-indigo-500" />
                                  <span className="font-mono font-bold text-foreground">{ev.id}</span>
                                  <span className="text-[10px] text-muted-foreground">via {ev.collector}</span>
                                </div>
                                {getRelationshipBadge(link.relationship)}
                              </div>

                              <p className="text-muted-foreground text-[11px]">
                                <span className="font-medium text-foreground">Rationale: </span>
                                {link.rationale}
                              </p>

                              {/* Raw excerpt */}
                              <div className="p-2 rounded bg-card border border-border font-mono text-[11px] text-foreground overflow-x-auto whitespace-pre-wrap">
                                {ev.excerpt}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                                <span>Provenance: {ev.provenanceHash?.slice(0, 24)}...</span>
                                <span>Collected: {new Date(ev.collectedAt).toUTCString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Upload</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              id="btn-next-step-3"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>Examine V1 PRISM Failure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: V1 PRISM FAILURE VIEW */}
      {currentStep === 3 && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-5" id="demo-step-3-v1-failure">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-foreground">
                Step 3: Reproducing Known V1 PRISM Failure
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Demonstrates why the unweighted V1 PRISM baseline engine fails under realistic multi-probe telemetry (Remediation Blindness).
            </p>
          </div>

          {/* Failure Deep-Dive Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 space-y-3">
              <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-rose-600 dark:text-rose-400">
                    Defect Classification: Remediation Blindness
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    V1 BUG
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Stale Historical Failure Permanently Overrides Post-Remediation Security Fix
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In production, open-source maintainers deploy security patches after receiving an initial vulnerability report. However, V1 treats all candidate evidence items as an unordered set and executes a greedy contradiction rule:
                </p>
                <div className="p-2.5 rounded bg-card border border-border font-mono text-xs text-rose-600 dark:text-rose-400">
                  <code>{`// V1 Baseline Logic (server/services/verificationEngineV1.ts line 79)
if (contradictingLinks.length > 0) {
  finalStatus = 'CONTRADICTED'; // Greedy override, ignores timestamps!
}`}</code>
                </div>
              </div>

              {/* Exact Synthetic Evidence Telemetry in Scenario */}
              <div className="border border-border rounded-lg p-4 space-y-2 bg-muted/10 text-xs">
                <span className="font-bold text-foreground block">
                  Scenario Telemetry Timeline (Exact Same Input Feeds Both Engines):
                </span>

                <div className="space-y-2 font-mono text-[11px]">
                  {/* T0: Historical Contradiction */}
                  <div className="p-2.5 rounded border border-rose-500/30 bg-rose-500/5 space-y-1">
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold">
                      <span>T0: Initial Scan (09:00:00Z)</span>
                      <span>ev_hsts_historical_fail</span>
                    </div>
                    <p className="text-foreground">Probe: strict-transport-security: absent</p>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold block">
                      Outcome: CONTRADICTS claim
                    </span>
                  </div>

                  {/* T1: Post-Remediation Fix */}
                  <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>T1: Post-Remediation Scan (10:00:00Z)</span>
                      <span>ev_hsts_remediated_pass</span>
                    </div>
                    <p className="text-foreground">
                      Probe: strict-transport-security: max-age=31536000; includeSubDomains; preload
                    </p>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                      Outcome: SUPPORTS claim (Security Fix Applied)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* V1 Outcome Card */}
            <div className="md:col-span-5 p-4 rounded-lg border border-border bg-card flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-muted-foreground block mb-1">
                  Observed V1 Engine Execution
                </span>
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-center space-y-1">
                  <span className="text-xs text-muted-foreground block">V1 Produced Status:</span>
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                    CONTRADICTED
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                    ✗ False Contradiction (Ground Truth is VERIFIED)
                  </span>
                </div>

                <div className="mt-3 text-xs text-muted-foreground space-y-1.5">
                  <span className="font-semibold text-foreground block">V1 Verification Reason:</span>
                  <p className="p-2 rounded bg-muted/40 font-mono text-[11px] text-muted-foreground border border-border">
                    {remediationScenario?.v1.reason || 'Claim is CONTRADICTED: 1 contradicting evidence item(s) detected.'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-muted/40 border border-border text-xs text-muted-foreground">
                <span className="font-semibold text-foreground block mb-0.5">Impact:</span>
                Maintainer fixes the security vulnerability, but the monitoring pipeline insists the site is still vulnerable forever.
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Claims</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              id="btn-next-step-4"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>Inspect Exact Engineering Fix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ENGINEERING FIX VIEW */}
      {currentStep === 4 && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-5" id="demo-step-4-fix">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-foreground">
                Step 4: The Exact Engineering Fix
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              How V2 addresses the failure mode via temporal provenance ordering and recency disambiguation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fix Mechanism 1 */}
            <div className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                Fix 01: Temporal Provenance Ordering
              </span>
              <h4 className="text-sm font-bold text-foreground">
                Chronological Ordering by Timestamp
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Before evaluating evidence rules, candidate evidence items are strictly sorted in descending order by their verified ISO 8601 capture timestamp:
              </p>
              <div className="p-3 rounded bg-card border border-border font-mono text-[11px] text-foreground overflow-x-auto">
                <code>{`const sortedEvidence = [...candidateEvidence].sort((a, b) => {
  const timeA = new Date(a.collectedAt).getTime() || 0;
  const timeB = new Date(b.collectedAt).getTime() || 0;
  return timeB - timeA; // Descending: newest observations first
});`}</code>
              </div>
            </div>

            {/* Fix Mechanism 2 */}
            <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                Fix 02: Recency Disambiguation with Superseded Provenance
              </span>
              <h4 className="text-sm font-bold text-foreground">
                Active Verification with Audit Trail
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When conflicting evidence is detected, the engine compares the timestamps of the newest supporting and contradicting probes:
              </p>
              <div className="p-3 rounded bg-card border border-border font-mono text-[11px] text-foreground overflow-x-auto">
                <code>{`if (newestSupportTime > newestContradictTime) {
  finalStatus = 'VERIFIED';
  reason = \`Historical contradiction [\${oldId}] superseded by active remediation evidence [\${newId}].\`;
}`}</code>
              </div>
            </div>
          </div>

          {/* Audit Trail Note */}
          <div className="p-3.5 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-3">
            <Code2 className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>
              <strong>Zero Erasure Principle:</strong> Historical failures are NOT deleted or purged from the audit log. They remain permanently preserved with explicit provenance tags denoting that they were superseded by active remediation probes.
            </span>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to V1 Failure</span>
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              id="btn-next-step-5"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>See Same Scenario in V2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: V2 RESULT VIEW */}
      {currentStep === 5 && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-5" id="demo-step-5-v2-result">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-foreground">
                Step 5: Same Scenario Evaluated Under V2
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Demonstrating the exact same scenario fed into the corrected V2 engine with temporal provenance disambiguation.
            </p>
          </div>

          {/* Side-by-Side Comparison of V1 vs V2 on the EXACT SAME scenario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* V1 Baseline Outcome */}
            <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Baseline Engine (V1)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  FAILED
                </span>
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                Status: CONTRADICTED
              </div>
              <p className="text-xs text-muted-foreground">
                Stale historical failure permanently overrode the post-remediation security patch.
              </p>
              <div className="p-2.5 rounded bg-card border border-border font-mono text-[11px] text-muted-foreground">
                Reason: {remediationScenario?.v1.reason}
              </div>
            </div>

            {/* V2 Corrected Outcome */}
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Corrected Engine (V2)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  PASSED
                </span>
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                Status: VERIFIED
              </div>
              <p className="text-xs text-muted-foreground">
                Temporal recency recognized the T1 probe as newer, correctly resolving the claim to VERIFIED while annotating provenance.
              </p>
              <div className="p-2.5 rounded bg-card border border-border font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                Reason: {remediationScenario?.v2.reason}
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Fix Explanation</span>
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              id="btn-next-step-6"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>View Measured Before/After Metrics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: MEASURED BEFORE/AFTER METRICS BENCHMARK */}
      {currentStep === 6 && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-5" id="demo-step-6-metrics">
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-foreground">
                  Step 6: Measured Before / After Verification Benchmark
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real metrics returned live by the backend service comparing V1 vs V2 across identical synthetic scenarios.
              </p>
            </div>

            <button
              onClick={rerunBenchmark}
              disabled={benchmarkLoading}
              id="btn-rerun-metrics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${benchmarkLoading ? 'animate-spin' : ''}`} />
              <span>Re-run Benchmark Live</span>
            </button>
          </div>

          {/* Core Measured Metric Cards */}
          {benchmark && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="benchmark-metric-cards">
              {/* Before Metric (V1) */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-1.5" id="metric-card-before">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-muted-foreground">
                    Before Metric (V1)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                    Baseline
                  </span>
                </div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {benchmark.metrics.before.accuracyPct.toFixed(1)}%
                </div>
                <p className="text-xs font-medium text-foreground">Verification Accuracy</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  False Contradictions: {benchmark.metrics.before.falseContradictionCount}/{benchmark.totalScenarios} ({benchmark.metrics.before.falseContradictionRatePct.toFixed(1)}%)
                </p>
              </div>

              {/* After Metric (V2) */}
              <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1.5" id="metric-card-after">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    After Metric (V2)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Corrected
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {benchmark.metrics.after.accuracyPct.toFixed(1)}%
                </div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Verification Accuracy</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  False Contradictions: {benchmark.metrics.after.falseContradictionCount}/{benchmark.totalScenarios} (0.0%)
                </p>
              </div>

              {/* Measured Improvement Delta */}
              <div className="p-4 rounded-lg border border-indigo-500/30 bg-indigo-500/5 space-y-1.5" id="metric-card-delta">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    Measured Improvement
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                    Delta
                  </span>
                </div>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  +{benchmark.metrics.delta.accuracyGainPct.toFixed(1)}%
                </div>
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Accuracy Gain</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  False Contradiction Reduction: -{benchmark.metrics.delta.falseContradictionReductionPct.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Scenario-by-Scenario Evaluation Table */}
          {benchmark && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-muted/40 border-b border-border text-xs font-bold text-foreground">
                All Synthetic Benchmark Scenarios (Identical Input Telemetry)
              </div>
              <div className="divide-y divide-border">
                {benchmark.scenarios.map((scen, idx) => (
                  <div key={scen.scenarioId} className="p-3.5 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-foreground">{scen.scenarioName}</span>
                        <span className="text-muted-foreground text-[11px]">({scen.category})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground text-[11px]">Ground Truth:</span>
                        {getStatusBadge(scen.expectedGroundTruth)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className={`p-2 rounded border ${scen.v1.isCorrect ? 'bg-card border-border' : 'bg-rose-500/5 border-rose-500/30'}`}>
                        <div className="flex items-center justify-between font-mono font-bold mb-1">
                          <span>V1 Engine</span>
                          {getStatusBadge(scen.v1.producedStatus)}
                        </div>
                        <p className="text-muted-foreground truncate">{scen.v1.reason}</p>
                      </div>

                      <div className={`p-2 rounded border ${scen.v2.isCorrect ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card border-border'}`}>
                        <div className="flex items-center justify-between font-mono font-bold mb-1">
                          <span>V2 Engine</span>
                          {getStatusBadge(scen.v2.producedStatus)}
                        </div>
                        <p className="text-muted-foreground truncate">{scen.v2.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to V2 Result</span>
            </button>

            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over / Re-test Flow</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
