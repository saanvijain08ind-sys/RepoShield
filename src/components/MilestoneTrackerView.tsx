import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Users,
  GitFork,
  Star,
  Download,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ProjectAnalysis } from '../types/index.ts';

interface MilestoneTrackerViewProps {
  analysis: ProjectAnalysis;
  onProceedToScanner: () => void;
}

export const MilestoneTrackerView: React.FC<MilestoneTrackerViewProps> = ({
  analysis,
  onProceedToScanner,
}) => {
  const { milestones, owner, repo, repoUrl, npmPackageName } = analysis;
  const isExceeded = milestones.thresholdExceeded;

  const starsPct = Math.min(100, Math.round((milestones.githubStars / milestones.starsThreshold) * 100));
  const downloadsPct = Math.min(
    100,
    Math.round((milestones.npmWeeklyDownloads / milestones.downloadsThreshold) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. Threshold Status Banner (Variation 2 Hero Banner) */}
      <div
        id="milestone-status-banner"
        className="p-6 sm:p-8 border-2 border-[#1a1a1c] dark:border-[#f0f6fc] bg-[#952424] text-white shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="label-mono text-white/80">
              Threshold Alert
            </span>
            <h2 className="font-syne text-xl sm:text-2xl font-extrabold uppercase tracking-tight mt-1.5 text-white">
              {isExceeded ? 'Transition Threshold Exceeded' : 'Hobby Milestone Tracking'}
            </h2>
            <p className="font-mono-code text-xs sm:text-sm mt-1 text-white/90 font-semibold">
              {owner}/{repo} {npmPackageName && <span className="opacity-80">(npm: {npmPackageName})</span>}
            </p>
          </div>

          <button
            id="proceed-to-scanner-btn"
            onClick={onProceedToScanner}
            className="px-4 sm:px-5 py-2.5 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity shrink-0 flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>AUDIT VULNERABILITIES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm mt-4 sm:mt-5 leading-relaxed text-white/85 max-w-3xl">
          Greater than 10,000 downloads and 1,000 GitHub stars. Security assessment advised before downstream impact scales. Zero-friction audits prevent downstream emergencies.
        </p>
      </div>

      {/* 2. Primary Milestone Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GitHub Stars */}
        <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mb-2">
            <span className="label-mono flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>GitHub Stars</span>
            </span>
            <span className="text-[10px] font-mono-code font-semibold px-1.5 py-0.5 border border-[#1a1a1c]/30 dark:border-[#f0f6fc]/30">
              Target: {milestones.starsThreshold.toLocaleString()}
            </span>
          </div>
          <div className="font-syne text-3xl font-extrabold text-[#1a1a1c] dark:text-[#f0f6fc]">
            {milestones.githubStars.toLocaleString()}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mb-1">
              <span>Threshold Progress</span>
              <span className="font-semibold">{starsPct}%</span>
            </div>
            <div className="h-2 w-full bg-[#1a1a1c]/10 dark:bg-[#f0f6fc]/10 border border-[#1a1a1c] dark:border-[#f0f6fc] overflow-hidden">
              <div
                className="h-full bg-[#2ea043] transition-all duration-500"
                style={{ width: `${starsPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* npm Weekly Downloads */}
        <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mb-2">
            <span className="label-mono flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#2ea043]" />
              <span>npm Downloads / wk</span>
            </span>
            <span className="text-[10px] font-mono-code font-semibold px-1.5 py-0.5 border border-[#1a1a1c]/30 dark:border-[#f0f6fc]/30">
              Target: {milestones.downloadsThreshold.toLocaleString()}
            </span>
          </div>
          <div className="font-syne text-3xl font-extrabold text-[#1a1a1c] dark:text-[#f0f6fc]">
            {milestones.npmWeeklyDownloads.toLocaleString()}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mb-1">
              <span>Adoption Velocity</span>
              <span className="font-semibold text-[#2ea043]">{downloadsPct}%</span>
            </div>
            <div className="h-2 w-full bg-[#1a1a1c]/10 dark:bg-[#f0f6fc]/10 border border-[#1a1a1c] dark:border-[#f0f6fc] overflow-hidden">
              <div
                className="h-full bg-[#2ea043] transition-all duration-500"
                style={{ width: `${downloadsPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Forks & Ecosystem Re-use */}
        <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mb-2">
            <span className="label-mono flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-purple-500" />
              <span>Repository Forks</span>
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono-code font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <div className="font-syne text-3xl font-extrabold text-[#1a1a1c] dark:text-[#f0f6fc]">
            {milestones.forks.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70">
            <Activity className="w-3.5 h-3.5 text-purple-500" />
            <span>Downstream forks & PRs</span>
          </div>
        </div>

        {/* Growth Velocity */}
        <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mb-2">
            <span className="label-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2ea043]" />
              <span>Adoption Velocity</span>
            </span>
            <span className="text-[10px] text-[#2ea043] font-mono-code font-bold">
              Live
            </span>
          </div>
          <div className="font-syne text-2xl font-extrabold text-[#2ea043] mt-1">
            {milestones.growthVelocity}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70">
            <span>Crossed viral threshold</span>
          </div>
        </div>
      </div>

      {/* 3. Blast Radius Counter & Downstream Impact Card */}
      <div
        id="blast-radius-card"
        className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-syne text-lg font-bold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc]">
                  Downstream Blast Radius Counter
                </h3>
                <span
                  className={`text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 border ${
                    milestones.blastRadius.criticalTier === 'CRITICAL_INFRASTRUCTURE'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/40'
                      : milestones.blastRadius.criticalTier === 'HIGH_IMPACT'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40'
                      : 'bg-[#2ea043]/10 text-[#2ea043] border-[#2ea043]/40'
                  }`}
                >
                  {milestones.blastRadius.criticalTier.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-0.5">
                Quantifies downstream exposure if vulnerable package dependencies remain unpatched.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="label-mono">Calculated Blast Radius</div>
            <div className="font-syne text-2xl sm:text-3xl font-extrabold text-[#cf222e]">
              ~{milestones.blastRadius.estimatedDownstreamUsers.toLocaleString()} Users
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
            <div className="label-mono">
              Dependent Repositories
            </div>
            <div className="font-syne text-2xl font-bold text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
              {milestones.blastRadius.dependentsCount.toLocaleString()}
            </div>
            <div className="text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-1">
              Projects importing this target
            </div>
          </div>

          <div className="p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
            <div className="label-mono">
              Estimated Downstream Reach
            </div>
            <div className="font-syne text-2xl font-bold text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
              {milestones.blastRadius.estimatedDownstreamUsers.toLocaleString()}
            </div>
            <div className="text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-1">
              Downstream users impacted
            </div>
          </div>

          <div className="p-4 bg-[#fff8f8] dark:bg-[#cf222e]/10 border-2 border-[#cf222e]">
            <div className="label-mono text-[#cf222e]">
              Supply Chain Urgency
            </div>
            <div className="font-syne text-2xl font-bold text-[#cf222e] mt-1">
              High Priority
            </div>
            <div className="text-xs font-mono-code text-[#cf222e] mt-1">
              {milestones.blastRadius.impactDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
