import React, { useState } from 'react';
import { Search, Github, Package, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  target: string;
  stars: number;
  downloads: number;
  badge: string;
}

interface SentinelSearchBarProps {
  onAnalyze: (target: string) => Promise<void> | void;
  isLoading: boolean;
  activeTarget?: string;
}

const DEMO_PRESETS: Preset[] = [
  {
    id: 'express',
    name: 'express',
    target: 'express',
    stars: 64850,
    downloads: 32400000,
    badge: '32.4M/wk • Critical Tier',
  },
  {
    id: 'superprompt-cli',
    name: 'superprompt-cli',
    target: 'superprompt-cli',
    stars: 1240,
    downloads: 14800,
    badge: '14.8k/wk • Viral Transition Moment',
  },
  {
    id: 'chalk',
    name: 'chalk',
    target: 'chalk',
    stars: 21500,
    downloads: 118000000,
    badge: '118M/wk • High Impact',
  },
];

export const SentinelSearchBar: React.FC<SentinelSearchBarProps> = ({
  onAnalyze,
  isLoading,
  activeTarget,
}) => {
  const [inputVal, setInputVal] = useState(activeTarget || 'superprompt-cli');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    onAnalyze(inputVal.trim());
  };

  const handleSelectPreset = (target: string) => {
    setInputVal(target);
    onAnalyze(target);
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0969da] dark:text-[#58a6ff] bg-[#0969da]/10 dark:bg-[#1f6feb]/20 px-2 py-0.5 rounded-full border border-[#0969da]/20 dark:border-[#1f6feb]/30">
              Zero-Setup Security Ingestion
            </span>
            <h2 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc] mt-1">
              Analyze Any Open-Source Target for Viral Milestone Transitions
            </h2>
          </div>
          <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
            Directly queries public GitHub metadata & Google OSV database
          </span>
        </div>

        {/* Sleek Input Bar */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#656d76] dark:text-[#8b949e]">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="sentinel-target-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter GitHub Repo URL (e.g. https://github.com/facebook/react) or npm package (e.g. express)"
              className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#656d76] dark:placeholder-[#8b949e] focus:outline-hidden focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] transition-all"
              disabled={isLoading}
            />
          </div>

          <button
            id="sentinel-analyze-submit-btn"
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md border border-[#1b1f24]/15 shadow-xs transition-colors disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning OSV Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Project Milestones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick-load demo buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-[#656d76] dark:text-[#8b949e] flex items-center gap-1">
            <span>Quick-Load Demo Repos:</span>
          </span>
          {DEMO_PRESETS.map((preset) => {
            const isSelected = inputVal.toLowerCase().includes(preset.name.toLowerCase());
            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                type="button"
                onClick={() => handleSelectPreset(preset.target)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
                  isSelected
                    ? 'bg-[#0969da]/10 dark:bg-[#1f6feb]/20 text-[#0969da] dark:text-[#58a6ff] border-[#0969da]/40 dark:border-[#1f6feb]/50 font-semibold'
                    : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#1f2328] dark:text-[#c9d1d9] border-[#d0d7de] dark:border-[#30363d] hover:bg-[#eaeef2] dark:hover:bg-[#30363d]'
                }`}
              >
                {preset.name.includes('/') ? (
                  <Github className="w-3 h-3 text-[#656d76] dark:text-[#8b949e]" />
                ) : (
                  <Package className="w-3 h-3 text-[#0969da] dark:text-[#58a6ff]" />
                )}
                <span className="font-mono">{preset.name}</span>
                <span className="text-[10px] px-1 py-0.2 rounded-sm bg-black/5 dark:bg-white/10 text-[#656d76] dark:text-[#8b949e]">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
