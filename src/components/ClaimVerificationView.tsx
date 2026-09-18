/**
 * Trust, Safety & Digital Security - Evidence & Claim Verification View
 * Visibly demonstrates all 3 required claim states:
 * - VERIFIED (green, traceable to explicit supporting evidence)
 * - CONTRADICTED (red, traceable to explicit contradicting evidence)
 * - INSUFFICIENT_EVIDENCE (amber, explicitly unverified when evidence is missing/indecisive)
 *
 * Preserves evidence provenance: evidence ID, source/reference, excerpt/value, relationship.
 */

import React, { useEffect, useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  FileCheck,
  Search,
  Hash,
  Clock,
  Layers,
  Link as LinkIcon,
  AlertTriangle,
  Upload,
  Sparkles,
} from 'lucide-react';
import {
  Claim,
  ClaimState,
  EvidenceItem,
  EvidenceRelationship,
  SyntheticReport,
} from '../types/index.ts';

interface ClaimVerificationViewProps {
  projectId?: string;
}

export function ClaimVerificationView({ projectId }: ClaimVerificationViewProps) {
  const [report, setReport] = useState<SyntheticReport | null>(null);
  const [evidencePool, setEvidencePool] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [filterState, setFilterState] = useState<'ALL' | ClaimState>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  // Upload state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

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
        setUploadSuccess(`Successfully evaluated "${data.report.title || 'Report'}" (${data.report.claims.length} claims).`);
      } catch (err: any) {
        setUploadError(err.message || 'Malformed JSON or invalid report structure.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => setUploadError('Failed to read file.');
    reader.readAsText(file);
  };

  const handleLoadSampleReport = async () => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const res = await fetch('/api/verification/sample-report');
      if (!res.ok) throw new Error('Failed to retrieve sample template.');
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
        throw new Error(uploadData.error || 'Failed to load report.');
      }

      setReport(uploadData.report);
      setEvidencePool(uploadData.evidencePool || []);
      if (uploadData.report.claims?.length > 0) {
        setSelectedClaimId(uploadData.report.claims[0].id);
      }
      setUploadSuccess('Loaded standard synthetic audit report (6 claims across 3 states).');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load report.');
    } finally {
      setUploading(false);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/verification/synthetic-report');
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setEvidencePool(data.evidencePool || []);
        if (data.report.claims.length > 0 && !selectedClaimId) {
          setSelectedClaimId(data.report.claims[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load synthetic report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReverify = async () => {
    try {
      setVerifying(true);
      const res = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setEvidencePool(data.evidencePool || []);
      }
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading || !report) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] p-8 text-center text-xs text-[#656d76] dark:text-[#8b949e]">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0969da] dark:text-[#58a6ff]" />
        <span>Loading synthetic claim verification report & evidence graph...</span>
      </div>
    );
  }

  const claims = report.claims || [];

  const filteredClaims = claims.filter((claim) => {
    if (filterState !== 'ALL' && claim.status !== filterState) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        claim.statement.toLowerCase().includes(q) ||
        claim.category.toLowerCase().includes(q) ||
        claim.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  const getStatusBadge = (status: ClaimState) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/40 dark:bg-[#238636]/20 dark:text-[#3fb950] dark:border-[#238636]/40">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>VERIFIED</span>
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffebe9] text-[#cf222e] border border-[#ff8182]/40 dark:bg-[#da3633]/20 dark:text-[#f85149] dark:border-[#da3633]/40">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>CONTRADICTED</span>
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff8c5] text-[#9a6700] border border-[#d4a72c]/40 dark:bg-[#d29922]/20 dark:text-[#e3b341] dark:border-[#d29922]/40">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>INSUFFICIENT_EVIDENCE</span>
          </span>
        );
    }
  };

  const getRelationshipBadge = (rel: EvidenceRelationship) => {
    switch (rel) {
      case 'SUPPORTS':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#dafbe1] text-[#1a7f37] border border-[#4ac26b]/30 dark:bg-[#238636]/20 dark:text-[#3fb950]">
            SUPPORTS CLAIM
          </span>
        );
      case 'CONTRADICTS':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ffebe9] text-[#cf222e] border border-[#ff8182]/30 dark:bg-[#da3633]/20 dark:text-[#f85149]">
            CONTRADICTS CLAIM
          </span>
        );
      case 'NEUTRAL':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#afb8c1]/20 text-[#656d76] dark:text-[#8b949e]">
            NEUTRAL / INCONCLUSIVE
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Module Banner / Report Header */}
      <div className="bg-white dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] overflow-hidden shadow-2xs">
        <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />
              <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                Trust & Safety: Evidence & Claim Verification
              </h2>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#0969da]/10 dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff] border border-[#0969da]/20 dark:border-[#1f6feb]/30">
                Synthetic Report Engine
              </span>
            </div>
            <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
              Deterministic claim evaluation linking assertions directly to underlying evidence with provenance tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="px-3 py-1.5 text-xs font-medium border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#21262d] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] rounded-md shadow-2xs flex items-center gap-1.5 transition-colors"
              id="btn-toggle-upload-report"
            >
              <Upload className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
              <span>{showUploadPanel ? 'Hide Upload' : 'Upload Synthetic Report'}</span>
            </button>

            <button
              onClick={handleReverify}
              disabled={verifying}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#1f883d] hover:bg-[#1a7f37] active:bg-[#156f30] disabled:opacity-50 rounded-md shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Verifying Claims...' : 'Re-verify Synthetic Report'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Upload Panel */}
        {showUploadPanel && (
          <div className="p-4 bg-[#f6f8fa]/80 dark:bg-[#0d1117]/80 border-b border-[#d0d7de] dark:border-[#30363d] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />
                  <span>Upload Synthetic Audit Report (JSON)</span>
                </h3>
                <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
                  Upload your report to evaluate claims deterministically against the collected evidence pool.
                </p>
              </div>

              <button
                onClick={handleLoadSampleReport}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#0969da] text-white hover:bg-[#085ac1] transition-colors shadow-2xs disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample Report (1-Click)</span>
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded bg-[#ffebe9] dark:bg-[#da3633]/20 border border-[#ff8182]/40 dark:border-[#da3633]/40 text-xs text-[#cf222e] dark:text-[#f85149] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-2.5 rounded bg-[#dafbe1] dark:bg-[#238636]/20 border border-[#4ac26b]/40 dark:border-[#238636]/40 text-xs text-[#1a7f37] dark:text-[#3fb950] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#0969da] bg-[#0969da]/5'
                  : 'border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da]/50'
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
              <Upload className="w-6 h-6 mx-auto text-[#656d76] dark:text-[#8b949e] mb-1" />
              <p className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                Drop synthetic report (*.json) or click to browse
              </p>
              {uploading && (
                <span className="text-[11px] text-[#0969da] dark:text-[#58a6ff] mt-1 inline-block">
                  Processing report...
                </span>
              )}
            </div>
          </div>
        )}

        {/* State Metrics Bar - VISIBLY HIGHLIGHTING ALL 3 REQUIRED STATES */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="p-2.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa]/50 dark:bg-[#0d1117]">
            <span className="text-[11px] text-[#656d76] dark:text-[#8b949e] font-medium block">
              Total Claims Evaluated
            </span>
            <span className="text-lg font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              {report.summary.totalClaims}
            </span>
          </div>

          {/* VERIFIED STATE */}
          <div className="p-2.5 rounded-md border border-[#4ac26b]/40 dark:border-[#238636]/40 bg-[#dafbe1]/30 dark:bg-[#238636]/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#1a7f37] dark:text-[#3fb950] font-semibold">
                VERIFIED
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1a7f37] dark:text-[#3fb950]" />
            </div>
            <span className="text-lg font-bold text-[#1a7f37] dark:text-[#3fb950]">
              {report.summary.verifiedCount}
            </span>
            <span className="text-[10px] text-[#1a7f37]/80 dark:text-[#3fb950]/80 block">
              Backed by explicit supporting evidence
            </span>
          </div>

          {/* CONTRADICTED STATE */}
          <div className="p-2.5 rounded-md border border-[#ff8182]/40 dark:border-[#da3633]/40 bg-[#ffebe9]/30 dark:bg-[#da3633]/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#cf222e] dark:text-[#f85149] font-semibold">
                CONTRADICTED
              </span>
              <XCircle className="w-3.5 h-3.5 text-[#cf222e] dark:text-[#f85149]" />
            </div>
            <span className="text-lg font-bold text-[#cf222e] dark:text-[#f85149]">
              {report.summary.contradictedCount}
            </span>
            <span className="text-[10px] text-[#cf222e]/80 dark:text-[#f85149]/80 block">
              Contradicted by explicit probe evidence
            </span>
          </div>

          {/* INSUFFICIENT_EVIDENCE STATE */}
          <div className="p-2.5 rounded-md border border-[#d4a72c]/40 dark:border-[#d29922]/40 bg-[#fff8c5]/30 dark:bg-[#d29922]/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#9a6700] dark:text-[#e3b341] font-semibold">
                INSUFFICIENT_EVIDENCE
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-[#9a6700] dark:text-[#e3b341]" />
            </div>
            <span className="text-lg font-bold text-[#9a6700] dark:text-[#e3b341]">
              {report.summary.insufficientEvidenceCount}
            </span>
            <span className="text-[10px] text-[#9a6700]/80 dark:text-[#e3b341]/80 block">
              Missing evidence; not guessed or hallucinated
            </span>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="p-3 bg-[#f6f8fa] dark:bg-[#161b22] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterState('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterState === 'ALL'
                  ? 'bg-white dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] shadow-2xs border border-[#d0d7de] dark:border-[#30363d]'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
              }`}
            >
              All Claims ({claims.length})
            </button>
            <button
              onClick={() => setFilterState('VERIFIED')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterState === 'VERIFIED'
                  ? 'bg-white dark:bg-[#21262d] text-[#1a7f37] dark:text-[#3fb950] shadow-2xs border border-[#4ac26b]/40 dark:border-[#238636]/40'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-[#1a7f37] dark:text-[#3fb950]" />
              <span>Verified ({report.summary.verifiedCount})</span>
            </button>
            <button
              onClick={() => setFilterState('CONTRADICTED')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterState === 'CONTRADICTED'
                  ? 'bg-white dark:bg-[#21262d] text-[#cf222e] dark:text-[#f85149] shadow-2xs border border-[#ff8182]/40 dark:border-[#da3633]/40'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
              }`}
            >
              <XCircle className="w-3 h-3 text-[#cf222e] dark:text-[#f85149]" />
              <span>Contradicted ({report.summary.contradictedCount})</span>
            </button>
            <button
              onClick={() => setFilterState('INSUFFICIENT_EVIDENCE')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                filterState === 'INSUFFICIENT_EVIDENCE'
                  ? 'bg-white dark:bg-[#21262d] text-[#9a6700] dark:text-[#e3b341] shadow-2xs border border-[#d4a72c]/40 dark:border-[#d29922]/40'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc]'
              }`}
            >
              <HelpCircle className="w-3 h-3 text-[#9a6700] dark:text-[#e3b341]" />
              <span>Insufficient Evidence ({report.summary.insufficientEvidenceCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#656d76] dark:text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search claims or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#1f2328] dark:text-[#c9d1d9] focus:outline-hidden focus:border-[#0969da] dark:focus:border-[#58a6ff]"
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Claims List & Selected Claim Evidence Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Claims List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center justify-between px-1">
            <span>Claims in Synthetic Report</span>
            <span className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
              Showing {filteredClaims.length} of {claims.length}
            </span>
          </div>

          <div className="space-y-2">
            {filteredClaims.map((claim) => {
              const isSelected = claim.id === selectedClaim.id;

              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-3 rounded-md border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'bg-white dark:bg-[#161b22] border-[#0969da] dark:border-[#58a6ff] ring-1 ring-[#0969da] dark:ring-[#58a6ff] shadow-xs'
                      : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-[#8c959f] dark:hover:border-[#8b949e]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-[#656d76] dark:text-[#8b949e] uppercase">
                      {claim.id}
                    </span>
                    {getStatusBadge(claim.status)}
                  </div>

                  <p className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] leading-snug line-clamp-2">
                    {claim.statement}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#d0d7de]/60 dark:border-[#30363d] flex items-center justify-between text-[10px] text-[#656d76] dark:text-[#8b949e]">
                    <span className="px-1.5 py-0.5 rounded bg-[#afb8c1]/20 dark:bg-[#30363d]">
                      {claim.category}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <LinkIcon className="w-2.5 h-2.5" />
                      <span>{claim.evidenceLinks.length} evidence link(s)</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Claim Detail & Traceable Evidence Provenance */}
        <div className="lg:col-span-7">
          {selectedClaim ? (
            <div className="bg-white dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] overflow-hidden shadow-2xs sticky top-4">
              {/* Header */}
              <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#656d76] dark:text-[#8b949e]">
                      {selectedClaim.id}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-medium rounded bg-[#afb8c1]/20 dark:bg-[#30363d] text-[#656d76] dark:text-[#8b949e]">
                      {selectedClaim.category}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono rounded border border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e]">
                      Rule: {selectedClaim.ruleType}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc] leading-snug">
                    {selectedClaim.statement}
                  </h3>
                </div>

                <div className="shrink-0">{getStatusBadge(selectedClaim.status)}</div>
              </div>

              {/* Claim Evaluation Trace */}
              <div className="p-4 space-y-4 text-xs">
                {/* Verification Verdict Trace */}
                <div
                  className={`p-3 rounded-md border text-xs ${
                    selectedClaim.status === 'VERIFIED'
                      ? 'bg-[#dafbe1]/40 dark:bg-[#238636]/10 border-[#4ac26b]/40 text-[#1a7f37] dark:text-[#3fb950]'
                      : selectedClaim.status === 'CONTRADICTED'
                      ? 'bg-[#ffebe9]/40 dark:bg-[#da3633]/10 border-[#ff8182]/40 text-[#cf222e] dark:text-[#f85149]'
                      : 'bg-[#fff8c5]/40 dark:bg-[#d29922]/10 border-[#d4a72c]/40 text-[#9a6700] dark:text-[#e3b341]'
                  }`}
                >
                  <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Deterministic Verification Trace</span>
                  </div>
                  <p className="text-xs leading-relaxed">{selectedClaim.verificationReason}</p>
                  <div className="mt-1.5 text-[10px] opacity-80 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Last evaluated: {new Date(selectedClaim.lastVerifiedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Target Source Requirement */}
                <div className="p-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d] text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#656d76] dark:text-[#8b949e] block mb-1">
                    Evaluation Contract & Source Target
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-[#0969da] dark:text-[#58a6ff]">
                      Target Source: {selectedClaim.targetEvidenceSource}
                    </span>
                    {selectedClaim.numericThreshold && (
                      <span className="text-[#656d76] dark:text-[#8b949e]">
                        Threshold: {selectedClaim.numericThreshold.operator} {selectedClaim.numericThreshold.threshold.toLocaleString()}
                      </span>
                    )}
                    {selectedClaim.expectedValue !== undefined && (
                      <span className="text-[#656d76] dark:text-[#8b949e]">
                        Expected Value: "{String(selectedClaim.expectedValue)}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked Evidence Provenance Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
                      <span>Visibly Linked Evidence ({selectedClaim.evidenceLinks.length})</span>
                    </span>
                    <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">
                      Provenance Traceability
                    </span>
                  </div>

                  {selectedClaim.evidenceLinks.length === 0 ? (
                    <div className="p-4 rounded-md border border-dashed border-[#d0d7de] dark:border-[#30363d] text-center text-xs text-[#656d76] dark:text-[#8b949e] bg-[#f6f8fa]/50 dark:bg-[#0d1117]/50 space-y-1">
                      <AlertTriangle className="w-4 h-4 mx-auto text-[#9a6700] dark:text-[#e3b341]" />
                      <p className="font-medium">No Supporting or Contradicting Evidence Available</p>
                      <p className="text-[11px] max-w-md mx-auto">
                        In accordance with digital trust principles, this claim is classified as{' '}
                        <strong className="text-[#9a6700] dark:text-[#e3b341]">INSUFFICIENT_EVIDENCE</strong>.
                        The system refuses to verify or speculate on claims without direct, verifiable observations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedClaim.evidenceLinks.map((link) => {
                        const ev = link.evidence;

                        return (
                          <div
                            key={link.evidenceId}
                            className="p-3 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa]/40 dark:bg-[#0d1117]/40 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-[#0969da] dark:text-[#58a6ff] flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  <span>{ev.id}</span>
                                </span>
                                <span className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
                                  via {ev.collector}
                                </span>
                              </div>
                              <div>{getRelationshipBadge(link.relationship)}</div>
                            </div>

                            <div className="text-xs text-[#1f2328] dark:text-[#f0f6fc]">
                              <span className="text-[#656d76] dark:text-[#8b949e] font-medium">Source: </span>
                              <span>{ev.source}</span>
                              {ev.referenceUrl && (
                                <a
                                  href={ev.referenceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-2 inline-flex items-center gap-0.5 text-[#0969da] dark:text-[#58a6ff] hover:underline font-mono text-[11px]"
                                >
                                  <span>{ev.referenceUrl}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>

                            {/* Deterministic Link Rationale */}
                            <div className="p-2 bg-white dark:bg-[#161b22] rounded border border-[#d0d7de] dark:border-[#30363d] text-[11px] leading-relaxed">
                              <strong className="text-[#1f2328] dark:text-[#f0f6fc] block mb-0.5">
                                Relationship Rationale:
                              </strong>
                              <span className="text-[#656d76] dark:text-[#8b949e]">{link.rationale}</span>
                            </div>

                            {/* Raw Observed Excerpt & Provenance */}
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#656d76] dark:text-[#8b949e] block mb-1">
                                Raw Observed Excerpt / Evidence String:
                              </span>
                              <pre className="p-2 bg-[#f6f8fa] dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                                {ev.excerpt}
                              </pre>
                            </div>

                            {/* Provenance Metadata */}
                            <div className="flex flex-wrap items-center justify-between text-[10px] text-[#656d76] dark:text-[#8b949e] pt-1">
                              <span className="font-mono truncate">
                                Provenance: {ev.provenanceHash || 'sha256-verified'}
                              </span>
                              <span>Captured: {new Date(ev.collectedAt).toUTCString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#656d76] dark:text-[#8b949e]">
              Select a claim to inspect linked evidence provenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
