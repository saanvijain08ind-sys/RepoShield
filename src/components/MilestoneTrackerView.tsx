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
    <div className="space-y-5">
      {/* 1. Threshold Status Banner */}
      <div
        id="milestone-status-banner"
        className={`p-4 sm:p-5 rounded-lg border transition-all ${
          isExceeded
            ? 'bg-[#fff8c5] dark:bg-[#633c01]/25 border-[#d4a72c] dark:border-[#d29922]/40 text-[#1f2328] dark:text-[#f0f6fc]'
            : 'bg-[#dafbe1] dark:bg-[#113818]/30 border-[#4ac26b] dark:border-[#238636]/40 text-[#1f2328] dark:text-[#f0f6fc]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-md shrink-0 ${
                isExceeded
                  ? 'bg-[#9a6700]/15 dark:bg-[#d29922]/20 text-[#9a6700] dark:text-[#d29922]'
                  : 'bg-[#1a7f37]/15 dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950]'
              }`}
            >
              {isExceeded ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/60 dark:bg-black/30 border-current">
                  {isExceeded ? 'Transition Threshold Exceeded' : 'Hobby Milestone Tracking'}
                </span>
                <span className="text-xs font-mono font-semibold">
                  {owner}/{repo}
                </span>
                {npmPackageName && (
                  <span className="text-xs text-[#656d76] dark:text-[#8b949e] font-mono">
                    (npm: {npmPackageName})
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                {milestones.exceededReason}
              </h3>
              <p className="text-xs text-[#656d76] dark:text-[#8b949e] max-w-3xl leading-relaxed">
                When hobby tools suddenly reach viral adoption, maintainers transition from isolated experimentation to managing critical digital supply chain dependencies. At this exact transition moment, zero-friction security audits prevent downstream emergency disclosures.
              </p>
            </div>
          </div>

          <button
            id="proceed-to-scanner-btn"
            onClick={onProceedToScanner}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md shadow-xs transition-colors shrink-0 self-start md:self-center"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Vulnerabilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Primary Milestone Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GitHub Stars */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#656d76] dark:text-[#8b949e] mb-2">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>GitHub Stars</span>
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d]">
              Target: {milestones.starsThreshold.toLocaleString()}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc]">
            {milestones.githubStars.toLocaleString()}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">
              <span>Threshold Progress</span>
              <span className="font-semibold text-[#1f2328] dark:text-[#c9d1d9]">{starsPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#afb8c1]/20 dark:bg-[#30363d] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${starsPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* npm Weekly Downloads */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#656d76] dark:text-[#8b949e] mb-2">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />
              <span>npm Downloads / wk</span>
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d]">
              Target: {milestones.downloadsThreshold.toLocaleString()}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc]">
            {milestones.npmWeeklyDownloads.toLocaleString()}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">
              <span>Adoption Velocity</span>
              <span className="font-semibold text-[#0969da] dark:text-[#58a6ff]">{downloadsPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#afb8c1]/20 dark:bg-[#30363d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0969da] dark:bg-[#58a6ff] rounded-full transition-all duration-500"
                style={{ width: `${downloadsPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Forks & Ecosystem Re-use */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#656d76] dark:text-[#8b949e] mb-2">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-purple-500" />
              <span>Repository Forks</span>
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc]">
            {milestones.forks.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            <Activity className="w-3.5 h-3.5 text-purple-500" />
            <span>Community fork branches & pull requests</span>
          </div>
        </div>

        {/* Growth Velocity */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#656d76] dark:text-[#8b949e] mb-2">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Adoption Velocity</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Live
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {milestones.growthVelocity}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            <span>Crossed viral threshold recently</span>
          </div>
        </div>
      </div>

      {/* 3. Blast Radius Counter & Downstream Impact Card */}
      <div
        id="blast-radius-card"
        className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                  Downstream Blast Radius Counter
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    milestones.blastRadius.criticalTier === 'CRITICAL_INFRASTRUCTURE'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                      : milestones.blastRadius.criticalTier === 'HIGH_IMPACT'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-[#0969da]/10 text-[#0969da] dark:text-[#58a6ff] border-[#0969da]/30'
                  }`}
                >
                  {milestones.blastRadius.criticalTier.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
                Quantifies the downstream organizational exposure if a vulnerable package version remains unpatched.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#656d76] dark:text-[#8b949e]">Calculated Blast Radius</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-red-600 dark:text-red-400">
              ~{milestones.blastRadius.estimatedDownstreamUsers.toLocaleString()} Users
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-3.5 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d]">
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] font-medium">
              Dependent Repositories
            </div>
            <div className="text-xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc] mt-1">
              {milestones.blastRadius.dependentsCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] mt-1">
              Downstream applications importing this module
            </div>
          </div>

          <div className="p-3.5 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d]">
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] font-medium">
              Estimated Downstream Users
            </div>
            <div className="text-xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc] mt-1">
              ~{milestones.blastRadius.estimatedDownstreamUsers.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] mt-1">
              End-users relying on products powered by this code
            </div>
          </div>

          <div className="p-3.5 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d] flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] font-medium">
                Downstream Impact Summary
              </div>
              <div className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] mt-1">
                {milestones.blastRadius.impactDescription}
              </div>
            </div>
            <div className="text-[11px] text-[#0969da] dark:text-[#58a6ff] flex items-center gap-1 mt-2">
              <span>Ready for 1-Click Fix PR</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
