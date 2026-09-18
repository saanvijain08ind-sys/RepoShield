import React, { useState } from 'react';
import { Star, Download, Users, RefreshCw, Zap, Sliders, History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Project, TransitionEvent } from '../types/index.ts';

interface Props {
  project: Project;
  events: TransitionEvent[];
  onMetricsUpdated: () => void;
  onOpenThresholds: () => void;
}

export const EngagementPanel: React.FC<Props> = ({
  project,
  events,
  onMetricsUpdated,
  onOpenThresholds,
}) => {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);

  const handleCheck = async (mockOptions?: { stars?: number; downloads?: number; contributors?: number }) => {
    setChecking(true);
    setError(null);
    setLastCheckMessage(null);

    try {
      const payload: any = {};
      if (mockOptions) {
        payload.mockMetrics = {
          githubStars: mockOptions.stars ?? project.currentMetrics?.githubStars,
          npmDownloads: mockOptions.downloads ?? project.currentMetrics?.npmDownloads,
          outsideContributors: mockOptions.contributors ?? project.currentMetrics?.outsideContributors,
        };
      }

      const res = await fetch(`/api/projects/${project.id}/check-engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to check metrics.');
      }

      if (data.newTransitionEvents && data.newTransitionEvents.length > 0) {
        setLastCheckMessage(`Threshold crossed! Generated ${data.newTransitionEvents.length} transition event(s) and educational security assessment recommendation.`);
      } else {
        setLastCheckMessage('Metrics updated. No new threshold crossings detected (or milestone previously recorded).');
      }

      onMetricsUpdated();
    } catch (err: any) {
      setError(err.message || 'Error checking engagement.');
    } finally {
      setChecking(false);
    }
  };

  const metrics = project.currentMetrics;
  const thresholds = project.thresholds;

  const starsProgress = metrics?.githubStars !== null && metrics?.githubStars !== undefined
    ? Math.min(100, Math.round((metrics.githubStars / thresholds.githubStars) * 100))
    : 0;

  const downloadsProgress = metrics?.npmDownloads !== null && metrics?.npmDownloads !== undefined
    ? Math.min(100, Math.round((metrics.npmDownloads / thresholds.npmDownloads) * 100))
    : 0;

  const contribProgress = metrics?.outsideContributors !== null && metrics?.outsideContributors !== undefined
    ? Math.min(100, Math.round((metrics.outsideContributors / thresholds.outsideContributors) * 100))
    : 0;

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] shadow-2xs p-4 space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d0d7de] dark:border-[#30363d] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-2">
            <span>Engagement Growth Indicators</span>
            {metrics?.source === 'live_api' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] border border-[#4ac26b]/40 dark:border-[#2ea043]/40">
                Live APIs
              </span>
            )}
            {metrics?.source === 'mock_fixture' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#fff8c5] dark:bg-[#633c01]/25 text-[#9a6700] dark:text-[#d29922] border border-[#d4a72c]/40 dark:border-[#bb8009]/40">
                Fixture Data
              </span>
            )}
            {metrics?.source === 'unavailable' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border border-[#d0d7de] dark:border-[#30363d]">
                Pending Check
              </span>
            )}
          </h3>
          <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
            Monitored against configurable milestone transition thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenThresholds}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e]" />
            <span>Edit Thresholds</span>
          </button>
          <button
            onClick={() => handleCheck()}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md transition-colors shadow-2xs disabled:opacity-50 border border-[#1b1f24]/15"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check Live Indicators'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#ffebe9] dark:bg-[#490202]/30 border border-[#ff8182]/40 dark:border-[#f85149]/40 rounded-md text-xs text-[#cf222e] dark:text-[#ff7b72] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {lastCheckMessage && (
        <div className="p-3 bg-[#ddf4ff] dark:bg-[#0c2d6b]/25 border border-[#54aeff]/40 dark:border-[#1f6feb]/40 rounded-md text-xs text-[#0969da] dark:text-[#58a6ff] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{lastCheckMessage}</span>
        </div>
      )}

      {metrics?.statusNotes && (
        <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#0d1117] px-3 py-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
          <span>{metrics.statusNotes}</span>
          <span className="font-mono text-[10px]">
            Updated: {new Date(metrics.lastCheckedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* GitHub Stars */}
        <div className="p-3.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#656d76] dark:text-[#8b949e]">
            <span className="flex items-center gap-1.5 font-medium text-[#1f2328] dark:text-[#f0f6fc]">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              GitHub Stars
            </span>
            <span className="text-[11px]">Threshold: {thresholds.githubStars.toLocaleString()}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              {metrics?.githubStars !== null && metrics?.githubStars !== undefined
                ? metrics.githubStars.toLocaleString()
                : '—'}
            </span>
            <span className="text-xs font-semibold text-[#0969da] dark:text-[#58a6ff]">{starsProgress}%</span>
          </div>

          <div className="w-full bg-[#eaeef2] dark:bg-[#21262d] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                starsProgress >= 100 ? 'bg-[#1f883d] dark:bg-[#238636]' : 'bg-[#0969da] dark:bg-[#1f6feb]'
              }`}
              style={{ width: `${starsProgress}%` }}
            />
          </div>
        </div>

        {/* npm Downloads */}
        <div className="p-3.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#656d76] dark:text-[#8b949e]">
            <span className="flex items-center gap-1.5 font-medium text-[#1f2328] dark:text-[#f0f6fc]">
              <Download className="w-3.5 h-3.5 text-blue-500" />
              npm Downloads (mo)
            </span>
            <span className="text-[11px]">Threshold: {thresholds.npmDownloads.toLocaleString()}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              {metrics?.npmDownloads !== null && metrics?.npmDownloads !== undefined
                ? metrics.npmDownloads.toLocaleString()
                : project.npmPackageName
                ? '0'
                : 'Not configured'}
            </span>
            <span className="text-xs font-semibold text-[#0969da] dark:text-[#58a6ff]">{downloadsProgress}%</span>
          </div>

          <div className="w-full bg-[#eaeef2] dark:bg-[#21262d] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                downloadsProgress >= 100 ? 'bg-[#1f883d] dark:bg-[#238636]' : 'bg-[#0969da] dark:bg-[#1f6feb]'
              }`}
              style={{ width: `${downloadsProgress}%` }}
            />
          </div>
        </div>

        {/* Outside Contributors */}
        <div className="p-3.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#656d76] dark:text-[#8b949e]">
            <span className="flex items-center gap-1.5 font-medium text-[#1f2328] dark:text-[#f0f6fc]">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              Outside Contributors
            </span>
            <span className="text-[11px]">Threshold: {thresholds.outsideContributors}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              {metrics?.outsideContributors !== null && metrics?.outsideContributors !== undefined
                ? metrics.outsideContributors
                : '—'}
            </span>
            <span className="text-xs font-semibold text-[#0969da] dark:text-[#58a6ff]">{contribProgress}%</span>
          </div>

          <div className="w-full bg-[#eaeef2] dark:bg-[#21262d] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                contribProgress >= 100 ? 'bg-[#1f883d] dark:bg-[#238636]' : 'bg-[#8250df] dark:bg-[#a371f7]'
              }`}
              style={{ width: `${contribProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Milestone Simulator Buttons */}
      <div className="pt-2 border-t border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#656d76] dark:text-[#8b949e] text-[11px] font-medium flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" /> Simulate Milestone Trigger:
        </span>
        <button
          onClick={() => handleCheck({ stars: 1050 })}
          disabled={checking}
          className="px-2.5 py-1 bg-[#fff8c5] dark:bg-[#633c01]/30 hover:bg-[#fae17d] dark:hover:bg-[#bb8009]/40 text-[#9a6700] dark:text-[#eac54f] border border-[#d4a72c]/40 dark:border-[#bb8009]/40 rounded-md text-[11px] font-medium transition-colors"
        >
          Cross 1,000 Stars (1,050)
        </button>
        <button
          onClick={() => handleCheck({ downloads: 12500 })}
          disabled={checking}
          className="px-2.5 py-1 bg-[#ddf4ff] dark:bg-[#0c2d6b]/30 hover:bg-[#b6e3ff] dark:hover:bg-[#1f6feb]/30 text-[#0969da] dark:text-[#58a6ff] border border-[#54aeff]/40 dark:border-[#1f6feb]/40 rounded-md text-[11px] font-medium transition-colors"
        >
          Cross 10,000 npm Downloads (12,500)
        </button>
        <button
          onClick={() => handleCheck({ contributors: 2 })}
          disabled={checking}
          className="px-2.5 py-1 bg-[#fbefff] dark:bg-[#3d1f6d]/30 hover:bg-[#ecd8ff] dark:hover:bg-[#8250df]/30 text-[#8250df] dark:text-[#d2a8ff] border border-[#d2a8ff]/40 dark:border-[#a371f7]/40 rounded-md text-[11px] font-medium transition-colors"
        >
          First Outside Contributor (2)
        </button>
      </div>

      {/* Transition Events Log */}
      {events.length > 0 && (
        <div className="pt-3 border-t border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e]" />
              Recorded Milestone Events ({events.length})
            </span>
            <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">
              Deduplication active: identical milestones trigger once
            </span>
          </div>
          <div className="space-y-1.5">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-md bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] capitalize">
                    {evt.triggerType.replace('_', ' ')}
                  </span>
                  <span className="text-[#656d76] dark:text-[#8b949e]">
                    Observed: <strong className="text-[#1f2328] dark:text-[#f0f6fc]">{evt.observedValue.toLocaleString()}</strong> (Threshold: {evt.threshold.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#656d76] dark:text-[#8b949e] font-mono">
                    {new Date(evt.timestamp).toLocaleDateString()} {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#afb8c1]/20 dark:bg-[#30363d] text-[#1f2328] dark:text-[#c9d1d9]">
                    Recorded
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
