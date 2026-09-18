/**
 * SentinelOSS - Main Application
 * Early-Warning Security Transition Tool for Open-Source Maintainers
 */

import React, { useState } from 'react';
import {
  Shield,
  Github,
  Sparkles,
  Terminal,
  Activity,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { SentinelFlow } from './components/SentinelFlow.tsx';
import { TestSuiteModal } from './components/TestSuiteModal.tsx';

export default function App() {
  const [isTestOpen, setIsTestOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] flex flex-col font-sans antialiased transition-colors">
      {/* GitHub-Themed Header */}
      <Header
        onOpenRegister={() => {}}
        onOpenTestSuite={() => setIsTestOpen(true)}
        onRefresh={() => {}}
        isRefreshing={false}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* SentinelOSS Mission & Early-Warning Transition Callout */}
        <div className="bg-[#ddf4ff] dark:bg-[#0c2d6b]/25 text-[#1f2328] dark:text-[#c9d1d9] p-4 sm:p-5 rounded-lg border border-[#54aeff]/40 dark:border-[#1f6feb]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0969da] dark:text-[#58a6ff] bg-[#0969da]/10 dark:bg-[#1f6feb]/20 px-2.5 py-0.5 rounded-full border border-[#0969da]/20 dark:border-[#1f6feb]/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Early-Warning Transition Monitor</span>
              </span>
              <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                Hobby ➔ Public Infrastructure
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              SentinelOSS — Protecting Open-Source at Viral Growth Moments
            </h1>
            <p className="text-xs text-[#656d76] dark:text-[#8b949e] max-w-3xl leading-relaxed">
              When hobby side-projects suddenly cross 10,000 npm weekly downloads or 1,000 GitHub stars, unpatched dependency vulnerabilities become supply chain emergencies. SentinelOSS tracks engagement milestones, audits Google OSV advisories with zero setup, and drafts celebratory, low-pressure maintainer outreach with 1-click fix pull requests.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              id="open-test-suite-btn"
              onClick={() => setIsTestOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-[#24292f] dark:text-[#c9d1d9] bg-white dark:bg-[#21262d] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] rounded-md border border-[#d0d7de] dark:border-[#30363d] shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Run Automated Tests</span>
            </button>
          </div>
        </div>

        {/* Primary Interactive Sentinel Flow */}
        <SentinelFlow onOpenTestSuite={() => setIsTestOpen(true)} />
      </main>

      {/* Automated In-App Test Suite Modal */}
      <TestSuiteModal isOpen={isTestOpen} onClose={() => setIsTestOpen(false)} />

      {/* Clean GitHub-Style Footer */}
      <footer className="mt-12 border-t border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] py-5 text-xs text-[#656d76] dark:text-[#8b949e] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>
              <strong className="text-[#1f2328] dark:text-[#f0f6fc]">SentinelOSS</strong> — Early-warning security transition & vulnerability remediation for open-source maintainers.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#656d76] dark:text-[#8b949e]">
            <span>Google OSV Database</span>
            <span>•</span>
            <span>Zero-Setup Ingestion</span>
            <span>•</span>
            <span>Low-Pressure Celebratory Outreach</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
